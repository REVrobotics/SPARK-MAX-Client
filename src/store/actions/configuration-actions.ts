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

export const loadConfigurations = (): SparkAction<Promise<any>> => {
  return (dispatch) => {
    dispatch(updateGlobalProcessStatus("LOADING..."));
    dispatch(updateGlobalIsProcessing(true));

    return DeviceConfigManager.load()
      .then((configurations) => {
        const validationResultSet = validateAndFixConfigurationSet(configurations);
        const [valid, notValid] = partition(validationResultSet, (result) => result.valid);
        const fixed = valid.filter(({violations}) => violations.length > 0);
        const validConfigurations = valid.map(({fixedConfiguration}) => deviceConfigurationFromDto(fixedConfiguration!));

        // Use only fixed device configurations
        dispatch(setConfigurations(validConfigurations));
        dispatch(updateGlobalIsProcessing(false));

        dispatch(addToMessageQueue(createMessagesForNotFixedConfigurations(notValid)));
        dispatch(addToMessageQueue(createMessagesForFixedConfigurations(fixed)));
      });
  };
};

export const selectConfiguration = (virtualDeviceId: VirtualDeviceId,
                                    configuration: IDeviceConfiguration): SparkAction<void> => {
  return (dispatch) => {
    dispatch(setOnlyTransientParameter(virtualDeviceId, "configurationId", getDeviceConfigurationId(configuration)));
  };
};

export const applyConfiguration = (virtualDeviceId: VirtualDeviceId,
                                   configuration: IDeviceConfiguration): SparkAction<Promise<any>> => {
  return (dispatch, getState) => {
    dispatch(updateDeviceIsProcessing(virtualDeviceId, true, ProcessType.SetConfiguration));
    dispatch(updateDeviceProcessStatus(virtualDeviceId, "SETTING CONFIGURATION..."));
    dispatch(setOnlyTransientParameter(virtualDeviceId, "configurationId", getDeviceConfigurationId(configuration)));

    const dependentsParams = uniq(flatMap(
      configuration.parameters,
      (value, param) => value == null ? [] : getDependentParams(param)));

    const paramsNeedsToBeRestored = dependentsParams.filter((param) => configuration.parameters[param] == null);

    const afterConfigSet = concatMapPromises(configuration.parameters, (value, param) => {
      if (value == null) {
        return Promise.resolve();
      }
      return dispatch(setOnlyParameterValue(virtualDeviceId, param, value)).then(noop);
    });

    return afterConfigSet
      .then(() => {
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
        dispatch(updateDeviceProcessStatus(virtualDeviceId, "CONNECTED"));
      });
  }
};

const persistConfiguration = (config: IDeviceConfiguration,
                              newName?: string): SparkAction<Promise<IDeviceConfiguration>> => {
  return (dispatch, getState) => {
    const device = querySelectedDevice(getState())!;
    const dto = deviceToDeviceConfigurationDto(config.raw, device, newName);
    const op = getDeviceConfigurationId(config) ? DeviceConfigManager.save(dto) : DeviceConfigManager.create(dto);
    return op.then(deviceConfigurationFromDto);
  };
};

export const renameConfiguration = (config: IDeviceConfiguration, newName: string): SparkAction<Promise<any>> =>
  (dispatch) =>
    dispatch(persistConfiguration(config, newName))
      .then((newConfig) => dispatch(updateConfiguration(getDeviceConfigurationId(newConfig), newConfig)));

export const saveConfiguration = (config: IDeviceConfiguration): SparkAction<Promise<void>> => {
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

export const saveConfigurationAs = (config: IDeviceConfiguration, name: string): SparkAction<Promise<any>> =>
  (dispatch) => {
    return dispatch(persistConfiguration(newDeviceConfiguration(config), name))
      .then((newConfig) => dispatch(addConfiguration(newConfig)));
  };

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
