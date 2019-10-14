import {flatMap, noop, partition, uniq} from "lodash";
import {
  ConfirmationAnswer,
  deviceConfigurationFromDto,
  deviceToDeviceConfigurationDto,
  getDeviceConfigurationId,
  IDeviceConfiguration,
  newDeviceConfiguration,
  ProcessType,
  VirtualDeviceId
} from "../state";
import {SparkAction} from "./action-types";
import {setOnlyParameterValue, setParameterValue} from "./parameter-actions";
import {forSelectedDevice} from "./action-creators";
import {showConfirmation} from "./ui-actions";
import {Intent} from "@blueprintjs/core";
import DeviceConfigManager from "../../managers/DeviceConfigManager";
import {
  addConfiguration,
  addToMessageQueue,
  removeConfiguration,
  resetTransientState,
  setConfigurations,
  setOnlyTransientParameter,
  updateConfiguration,
  updateDeviceIsProcessing,
  updateDeviceProcessStatus,
  updateGlobalIsProcessing,
  updateGlobalProcessStatus
} from "./atom-actions";
import {validateAndFixConfigurationSet} from "../device-config/device-config-validator";
import {createMessagesForFixedConfigurations, createMessagesForNotFixedConfigurations} from "../startup-messages";
import {concatMapPromises} from "../../utils/promise-utils";
import {getDependentParams} from "../../models/ConfigParam";
import {getConfigParamRule} from "../config-param-rules";
import {createRamConfigParamContext} from "../ram-config-param-rules";
import {queryDeviceParameterValue, querySelectedDevice} from "../selectors";

/**
 * Loads all device configurations.
 * Also this method validates all loaded configurations and shows message queue dialog, if necessary,
 */
export const loadConfigurations = (): SparkAction<Promise<any>> => {
  return (dispatch) => {
    dispatch(updateGlobalProcessStatus("LOADING..."));
    dispatch(updateGlobalIsProcessing(true));

    return DeviceConfigManager.load()
      .then((configurations) => {
        // Validate configurations and fix them if it is possible.
        // Anyway we collect set of violations.
        const validationResultSet = validateAndFixConfigurationSet(configurations);
        const [valid, notValid] = partition(validationResultSet, (result) => result.valid);
        const fixed = valid.filter(({violations}) => violations.length > 0);
        const validConfigurations = valid.map(({fixedConfiguration}) => deviceConfigurationFromDto(fixedConfiguration!));

        // Use only fixed device configurations
        dispatch(setConfigurations(validConfigurations));
        dispatch(updateGlobalIsProcessing(false));

        // Add all violations to message queue
        dispatch(addToMessageQueue(createMessagesForNotFixedConfigurations(notValid)));
        dispatch(addToMessageQueue(createMessagesForFixedConfigurations(fixed)));
      });
  };
};

/**
 * Selects configuration for specific device
 */
export const selectConfiguration = (virtualDeviceId: VirtualDeviceId,
                                    configuration: IDeviceConfiguration): SparkAction<void> => {
  return (dispatch) => {
    dispatch(setOnlyTransientParameter(virtualDeviceId, "configurationId", getDeviceConfigurationId(configuration)));
  };
};

/**
 * Applies configuration for specific device
 */
export const applyConfiguration = (virtualDeviceId: VirtualDeviceId,
                                   configuration: IDeviceConfiguration): SparkAction<Promise<any>> => {
  return (dispatch, getState) => {
    // Start processing to disable UI.
    dispatch(updateDeviceIsProcessing(virtualDeviceId, true, ProcessType.SetConfiguration));
    dispatch(updateDeviceProcessStatus(virtualDeviceId, "SETTING CONFIGURATION..."));
    dispatch(setOnlyTransientParameter(virtualDeviceId, "configurationId", getDeviceConfigurationId(configuration)));

    // Define set of parameters which depend on parameters to be set.
    const dependentsParams = uniq(flatMap(
      configuration.parameters,
      (value, param) => value == null ? [] : getDependentParams(param)));

    // If parameters to be set do not include values for dependent parameters,
    // this means we have to reset all dependent parameters to some valid value.
    // Here we define set of parameters to be restored.
    const paramsNeedsToBeRestored = dependentsParams.filter((param) => configuration.parameters[param] == null);

    // Set all parameters existing in configuration
    const afterConfigSet = concatMapPromises(configuration.parameters, (value, param) => {
      if (value == null) {
        return Promise.resolve();
      }
      return dispatch(setOnlyParameterValue(virtualDeviceId, param, value)).then(noop);
    });

    return afterConfigSet
      .then(() => {
        // Restore values for dependent parameters
        const ctx = createRamConfigParamContext(getState());
        return concatMapPromises(paramsNeedsToBeRestored, (param) => {
          const rule = getConfigParamRule(param);
          if (rule == null || rule.restore == null) {
            return Promise.resolve();
          }

          const restoredValue = rule.restore(ctx);
          const currentValue = queryDeviceParameterValue(getState(), virtualDeviceId, param);
          if (restoredValue === currentValue) {
            return Promise.resolve();
          }

          return dispatch(setParameterValue(virtualDeviceId, param, restoredValue)).then(noop);
        });
      })
      .finally(() => {
        dispatch(resetTransientState(virtualDeviceId));
        dispatch(updateDeviceIsProcessing(virtualDeviceId, false));
        dispatch(updateDeviceProcessStatus(virtualDeviceId, ""));
      });
  }
};

/**
 * Saves given configuration under the given name
 */
const persistConfiguration = (config: IDeviceConfiguration,
                              newName?: string): SparkAction<Promise<IDeviceConfiguration>> => {
  return (dispatch, getState) => {
    const device = querySelectedDevice(getState())!;
    const dto = deviceToDeviceConfigurationDto(config.raw, device, newName);
    const op = getDeviceConfigurationId(config) ? DeviceConfigManager.overwrite(dto) : DeviceConfigManager.create(dto);
    return op.then(deviceConfigurationFromDto);
  };
};

/**
 * Renames configuration
 */
export const renameConfiguration = (config: IDeviceConfiguration, newName: string): SparkAction<Promise<any>> =>
  (dispatch) =>
    dispatch(persistConfiguration(config, newName))
      .then((newConfig) => dispatch(updateConfiguration(getDeviceConfigurationId(newConfig), newConfig)));

/**
 * Overwrites configuration
 */
export const overwriteConfiguration = (config: IDeviceConfiguration): SparkAction<Promise<void>> => {
  return (dispatch, getState) => {
    return dispatch(showConfirmation({
      yesLabel: "Yes",
      cancelLabel: "No",
      intent: Intent.SUCCESS,
      text: "Do you want to overwrite existing configuration?",
    })).then((answer) => {
      if (answer === ConfirmationAnswer.Yes) {
        return dispatch(persistConfiguration(config))
          .then((newConfig) => dispatch(updateConfiguration(getDeviceConfigurationId(newConfig), newConfig)))
          .then(noop);
      } else {
        return Promise.resolve();
      }
    });
  }
};

/**
 * Creates new configuration
 */
export const createConfiguration = (config: IDeviceConfiguration, name: string): SparkAction<Promise<any>> =>
  (dispatch) => {
    return dispatch(persistConfiguration(newDeviceConfiguration(config), name))
      .then((newConfig) => dispatch(addConfiguration(newConfig)));
  };

/**
 * Destroys configuration
 */
export const destroyConfiguration = (config: IDeviceConfiguration): SparkAction<Promise<any>> =>
  (dispatch) => {
    return dispatch(showConfirmation({
      yesLabel: "Yes",
      cancelLabel: "No",
      intent: Intent.SUCCESS,
      text: "Do you want to remove this configuration?",
    })).then((answer) => {
      if (answer !== ConfirmationAnswer.Yes) {
        return;
      }

      const id = getDeviceConfigurationId(config);
      return DeviceConfigManager.remove(id)
        .then(() => dispatch(removeConfiguration(id)))
        .then(noop);
    });
  };

export const selectConfigurationForSelectedDevice = forSelectedDevice(selectConfiguration);
export const applyConfigurationForSelectedDevice = forSelectedDevice(applyConfiguration);
