import {flatMap, noop, partition, uniq} from "lodash";
import {
  ConfirmationAnswer,
  deviceConfigurationFromDto,
  getDeviceConfigurationId,
  IDeviceConfiguration,
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
  addToMessageQueue, resetTransientState,
  setConfigurations,
  setOnlyTransientParameter,
  updateDeviceIsProcessing, updateDeviceProcessStatus,
  updateGlobalIsProcessing,
  updateGlobalProcessStatus
} from "./atom-actions";
import {validateAndFixConfigurationSet} from "../device-config/device-config-validator";
import {createMessagesForFixedConfigurations, createMessagesForNotFixedConfigurations} from "../startup-messages";
import {concatMapPromises} from "../../utils/promise-utils";
import {getDependentParams} from "../../models/ConfigParam";
import {getConfigParamRule} from "../config-param-rules";
import {createRamConfigParamContext} from "../ram-config-param-rules";
import {queryDeviceParameterValue} from "../selectors";

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
                                   configuration: IDeviceConfiguration): SparkAction<Promise<any>> => {
  return (dispatch) => {
    dispatch(setOnlyTransientParameter(virtualDeviceId, "configurationId", getDeviceConfigurationId(configuration)));
    return dispatch(applyConfiguration(virtualDeviceId, configuration));
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

export const renameConfiguration = (item: IDeviceConfiguration, name: string): SparkAction<Promise<any>> => {
  return (dispatch, getState) => {
    return Promise.resolve();
  }
};

export const saveConfiguration = (item: IDeviceConfiguration): SparkAction<Promise<any>> => {
  return (dispatch, getState) => {
    return dispatch(showConfirmation({
      yesLabel: "Yes",
      cancelLabel: "No",
      intent: Intent.SUCCESS,
      text: "Do you want to overwrite existing configuration?",
    })).then((answer) => {
      if (answer === ConfirmationAnswer.Yes) {
        console.log("save");
      }
    });
  }
};

export const saveConfigurationAs = (item: IDeviceConfiguration, name: string): SparkAction<Promise<any>> => {
  return (dispatch, getState) => {
    return Promise.resolve();
  }
};

export const removeConfiguration = (item: IDeviceConfiguration): SparkAction<Promise<any>> => {
  return (dispatch, getState) => {
    return Promise.resolve();
  }
};

export const selectConfigurationForSelectedDevice = forSelectedDevice(selectConfiguration);
export const applyConfigurationForSelectedDevice = forSelectedDevice(applyConfiguration);
