import {identity} from "lodash";
import {ConfirmationAnswer, DeviceId, ProcessType, SparkAction} from "./types";
import {showConfirmation} from "./ui-actions";
import {getDevice} from "./selectors";
import MotorConfiguration, {getFromID} from "../models/MotorConfiguration";
import SparkManager, {IServerResponse} from "../managers/SparkManager";
import {fromDeviceId} from "./reducer";
import {delayPromise} from "../utils/promise-utils";
import {
  addLog,
  setBurnedMotorConfig, setDeviceLoaded,
  setMotorConfig,
  setMotorConfigParameter,
  setParamResponses,
  updateDeviceIsProcessing,
  updateDeviceProcessStatus
} from "./actions";
import {ConfigParam} from "../models/proto-gen/SPARK-MAX-Types_dto_pb";
import {forSelectedDevice} from "./action-creators";

const createTypedSetter = <T>(fromTypedValue: (value: T) => number, toTypedValue: (value: number) => T) =>
  (deviceId: DeviceId, motorField: keyof MotorConfiguration, param: ConfigParam, value: T): SparkAction<Promise<T>> =>
    (dispatch) => {
      return SparkManager.setAndGetParameter(fromDeviceId(deviceId), param, fromTypedValue(value))
        .then((res: IServerResponse) => {
          const responseValue = toTypedValue(res.responseValue as number);
          dispatch(setMotorConfigParameter(deviceId, {
            configName: motorField,
            configValue: responseValue,
            configParam: param,
            response: res,
          }));
          return responseValue;
        });
    };

export const setNumberParameter = createTypedSetter<number>(identity, identity);
export const setBooleanParameter = createTypedSetter<boolean>((value) => value ? 1 : 0, (value) => value === 1);

export const loadParameters = (deviceId: DeviceId): SparkAction<Promise<void>> =>
  (dispatch) => {
    dispatch(updateDeviceProcessStatus(deviceId, "GETTING PARAMETERS..."));

    const paramResponses: IServerResponse[] = [];
    for (let i = 0; i < 75; i++) {
      paramResponses.push({requestValue: "", responseValue: "", status: 0, type: 0});
    }
    dispatch(setParamResponses(deviceId, paramResponses));

    return delayPromise(1000)
      .then(() => SparkManager.getConfigFromParams(fromDeviceId(deviceId)))
      .then((config: MotorConfiguration) => {
        dispatch(updateDeviceProcessStatus(deviceId, "CONNECTED"));
        dispatch(updateDeviceIsProcessing(deviceId, false));
        dispatch(setMotorConfig(deviceId, config));
        dispatch(setDeviceLoaded(deviceId, true));
        const burn: MotorConfiguration = new MotorConfiguration(config.name, config.type).fromJSON(config.toJSON());
        dispatch(setBurnedMotorConfig(deviceId, burn));
      })
      .catch((error: any) => {
        dispatch(updateDeviceProcessStatus(deviceId, "FAILED TO GET PARAMETERS"));
        dispatch(updateDeviceIsProcessing(deviceId, false));
        dispatch(addLog(error));
      });
  };

export const burnConfiguration = (deviceId: DeviceId): SparkAction<Promise<void>> =>
  (dispatch, getState) => {
    const device = getDevice(getState(), deviceId);
    const activeMotorType = getFromID(device.currentConfig.type);

    return dispatch(showConfirmation({
      intent: "success",
      text: `Are you sure you want to update the configuration of your SPARK controller to a ${activeMotorType.name} motor?`,
      yesLabel: "Yes, Update",
      cancelLabel: "Cancel"
    })).then((answer) => {
      if (answer === ConfirmationAnswer.Cancel) {
        return;
      }

      dispatch(updateDeviceIsProcessing(deviceId, true, ProcessType.Save));
      return SparkManager.burnFlash(fromDeviceId(deviceId))
        .then(() => delayPromise(1000))
        .then(() =>
          SparkManager.getConfigFromParams(fromDeviceId(deviceId)).then((config: MotorConfiguration) => {
            dispatch(setMotorConfig(config));
            dispatch(setBurnedMotorConfig(new MotorConfiguration(config.name, config.type).fromJSON(config.toJSON())));
          }))
        .finally(() => {
          dispatch(updateDeviceIsProcessing(deviceId, false));
        });
    });
  };

export const resetConfiguration = (deviceId: DeviceId): SparkAction<Promise<void>> =>
  (dispatch) => {
    return dispatch(showConfirmation({
      intent: "warning",
      text: "WARNING: You are about to restore the connected SPARK MAX controller to its factory default settings. Make sure to properly configure the controller before attempting to operate. Are you sure you want to proceed?",
      yesLabel: "Yes",
      cancelLabel: "Cancel"
    })).then((answer) => {
      if (answer === ConfirmationAnswer.Cancel) {
        return;
      }

      dispatch(updateDeviceIsProcessing(deviceId, true, ProcessType.Reset));
      dispatch(updateDeviceProcessStatus(deviceId, "RESETTING..."));

      return SparkManager.restoreDefaults(fromDeviceId(deviceId))
        .then(() => {
          dispatch(updateDeviceProcessStatus(deviceId, "GETTING PARAMETERS..."));
          return delayPromise(1000);
        })
        .then(() =>
          SparkManager.getConfigFromParams(fromDeviceId(deviceId)).then((config: MotorConfiguration) => {
            dispatch(setMotorConfig(deviceId, config));
            dispatch(setBurnedMotorConfig(new MotorConfiguration(config.name, config.type).fromJSON(config.toJSON())));
          }))
        .finally(() => {
          dispatch(updateDeviceIsProcessing(deviceId, false));
          dispatch(updateDeviceProcessStatus(deviceId, "CONNECTED"));
        });
    });
  };

export const setSelectedDeviceNumberParameter = forSelectedDevice(setNumberParameter);
export const setSelectedDeviceBooleanParameter = forSelectedDevice(setBooleanParameter);
export const burnSelectedDeviceConfiguration = forSelectedDevice(burnConfiguration);
export const resetSelectedDeviceConfiguration = forSelectedDevice(resetConfiguration);
