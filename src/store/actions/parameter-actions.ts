import {ActionType, SparkAction} from "./action-types";
import {showConfirmation} from "./ui-actions";
import {queryDevice, queryDeviceId, queryDeviceParameterValue, queryHasDeviceParameterError} from "../selectors";
import SparkManager, {IServerResponse} from "../../managers/SparkManager";
import {delayPromise} from "../../utils/promise-utils";
import {
  addLog,
  recalculateDeviceId,
  setDeviceLoaded,
  setDeviceParameter,
  setDeviceParameterResponse,
  setParameters,
  updateDeviceIsProcessing,
  updateDeviceProcessStatus
} from "./atom-actions";
import {ConfigParam, MotorType, SensorType} from "../../models/dto";
import {forSelectedDevice} from "./action-creators";
import {
  ConfirmationAnswer,
  fromDeviceId,
  IDeviceTransientState,
  isDeviceNotConfigured,
  ProcessType,
  VirtualDeviceId
} from "../state";
import {MOTOR_TYPES} from "../dictionaries";
import {onSchedule} from "../../utils/redux-scheduler";

export const setParameterValue = (virtualDeviceId: VirtualDeviceId,
                                  param: ConfigParam,
                                  value: number): SparkAction<Promise<number>> =>
  (dispatch) => {
    // Change device parameter value immediately for better UX
    dispatch(setDeviceParameter(virtualDeviceId, param, value));

    // Set value for requested and all dependent parameters
    return dispatch(scheduleSetParameterValue(virtualDeviceId, param, value));
  };

const scheduleSetParameterValue = (virtualDeviceId: VirtualDeviceId,
                                   param: ConfigParam,
                                   value: number): SparkAction<Promise<number>> =>
  onSchedule("set-parameter", virtualDeviceId, param, (dispatch, getState) => {
    // It is supposed that device parameter value was already changed, this way we pass the last parameter as false
    // This is done only for better UX
    const mainParameter = dispatch(setSingleParameterValue(virtualDeviceId, param, value, false));

    if (param === ConfigParam.kMotorType) {
      return mainParameter
        .then((mainValue) => {
          const motorType = queryDeviceParameterValue(getState(), virtualDeviceId, param);
          if (motorType === MotorType.Brushless) {
            return dispatch(setSingleParameterValue(virtualDeviceId, ConfigParam.kSensorType, SensorType.HallSensor));
          } else {
            return Promise.resolve<number>(mainValue);
          }
        });
    }
    return mainParameter;
  });

const setSingleParameterValue = (virtualDeviceId: VirtualDeviceId,
                                 param: ConfigParam,
                                 value: number,
                                 // should we set parameter value or value was already set
                                 withInitialSet: boolean = true): SparkAction<Promise<number>> =>
  (dispatch, getState) => {
    if (withInitialSet) {
      dispatch(setDeviceParameter(virtualDeviceId, param, value));
    }

    // If value is invalid we should not send it into the device
    if (queryHasDeviceParameterError(getState(), virtualDeviceId, param)) {
      return Promise.resolve(value);
    }

    const device = queryDevice(getState(), virtualDeviceId);

    const deviceId = fromDeviceId(device.fullDeviceId);

    if (isDeviceNotConfigured(device) && param === ConfigParam.kCanID) {
      return SparkManager.idAssignment(value, device.uniqueId)
        .then(() => {
          // Generate server response, because validation logic can rely on response
          const res: IServerResponse = { status: 0, type: 1, requestValue: value, responseValue: value };
          dispatch(setDeviceParameterResponse(virtualDeviceId, param, res, true));
          dispatch(recalculateDeviceId(virtualDeviceId));
          return value;
        });
    } else {
      return SparkManager.setAndGetParameter(deviceId, param, value)
        .then((res: IServerResponse) => {
          const responseValue = res.responseValue as number;
          dispatch(setDeviceParameterResponse(virtualDeviceId, param, res, res.responseValue !== res.requestValue));
          if (param === ConfigParam.kCanID) {
            dispatch(recalculateDeviceId(virtualDeviceId));
          }
          return responseValue;
        });
    }
  };

export const loadParameters = (virtualDeviceId: VirtualDeviceId): SparkAction<Promise<void>> =>
  onSchedule("device-action", virtualDeviceId, (dispatch, getState) => {
    dispatch(updateDeviceProcessStatus(virtualDeviceId, "GETTING PARAMETERS..."));

    return delayPromise(1000)
      .then(() => SparkManager.getConfigFromParams(fromDeviceId(queryDeviceId(getState(), virtualDeviceId)!)))
      .then((values) => {
        dispatch(updateDeviceProcessStatus(virtualDeviceId, "CONNECTED"));
        dispatch(updateDeviceIsProcessing(virtualDeviceId, false));
        dispatch(setDeviceLoaded(virtualDeviceId, true));
        dispatch(setParameters(virtualDeviceId, values))
      })
      .catch((error: any) => {
        dispatch(updateDeviceProcessStatus(virtualDeviceId, "FAILED TO GET PARAMETERS"));
        dispatch(updateDeviceIsProcessing(virtualDeviceId, false));
        dispatch(addLog(error));
      });
  });

export const burnConfiguration = (virtualDeviceId: VirtualDeviceId): SparkAction<Promise<void>> =>
  onSchedule("device-action", virtualDeviceId, (dispatch, getState) => {
    const motorType = queryDeviceParameterValue(getState(), virtualDeviceId, ConfigParam.kMotorType);
    const activeMotorType = MOTOR_TYPES.get(motorType);

    return dispatch(showConfirmation({
      intent: "success",
      text: `Are you sure you want to update the configuration of your SPARK controller to a ${activeMotorType} motor?`,
      yesLabel: "Yes, Update",
      cancelLabel: "Cancel"
    })).then((answer) => {
      if (answer === ConfirmationAnswer.Cancel) {
        return;
      }

      const deviceId = queryDeviceId(getState(), virtualDeviceId)!;

      dispatch(updateDeviceIsProcessing(virtualDeviceId, true, ProcessType.Save));
      return SparkManager.burnFlash(fromDeviceId(deviceId))
        .then(() => delayPromise(1000))
        .then(() =>
          SparkManager.getConfigFromParams(fromDeviceId(deviceId)).then((values) => {
            dispatch(setParameters(virtualDeviceId, values));
          }))
        .finally(() => {
          dispatch(updateDeviceIsProcessing(virtualDeviceId, false));
        });
    });
  });

export const resetConfiguration = (virtualDeviceId: VirtualDeviceId): SparkAction<Promise<void>> =>
  onSchedule("device-action", virtualDeviceId, (dispatch, getState) => {
    return dispatch(showConfirmation({
      intent: "warning",
      text: "WARNING: You are about to restore the connected SPARK MAX controller to its factory default settings. Make sure to properly configure the controller before attempting to operate. Are you sure you want to proceed?",
      yesLabel: "Yes",
      cancelLabel: "Cancel"
    })).then((answer) => {
      if (answer === ConfirmationAnswer.Cancel) {
        return;
      }

      dispatch(updateDeviceIsProcessing(virtualDeviceId, true, ProcessType.Reset));
      dispatch(updateDeviceProcessStatus(virtualDeviceId, "RESETTING..."));

      const deviceId = queryDeviceId(getState(), virtualDeviceId)!;

      return SparkManager.restoreDefaults(fromDeviceId(deviceId))
        .then(() => {
          dispatch(updateDeviceProcessStatus(virtualDeviceId, "GETTING PARAMETERS..."));
          return delayPromise(1000);
        })
        .then(() =>
          SparkManager.getConfigFromParams(fromDeviceId(deviceId)).then((values) => {
            dispatch(setParameters(virtualDeviceId, values));
          }))
        .finally(() => {
          dispatch(updateDeviceIsProcessing(virtualDeviceId, false));
          dispatch(updateDeviceProcessStatus(virtualDeviceId, "CONNECTED"));
        });
    });
  });

const setTransientParameter = (virtualDeviceId: VirtualDeviceId,
                               field: keyof IDeviceTransientState,
                               value: any): SparkAction<Promise<any>> =>
  (dispatch) => {
    dispatch({
      type: ActionType.SET_TRANSIENT_PARAMETER,
      payload: {
        virtualDeviceId,
        field,
        value,
      },
    });
    if (field === "rampRateEnabled" && !value) {
      // If ramp rate is not enabled => reset ramp rate value
      return dispatch(setParameterValue(virtualDeviceId, ConfigParam.kRampRate, 0));
    } else {
      return Promise.resolve();
    }
  };

export const setSelectedDeviceParameterValue = forSelectedDevice(setParameterValue);
export const burnSelectedDeviceConfiguration = forSelectedDevice(burnConfiguration);
export const resetSelectedDeviceConfiguration = forSelectedDevice(resetConfiguration);
export const setSelectedDeviceTransientParameter = forSelectedDevice(setTransientParameter);