import {SparkAction} from "./action-types";
import {showConfirmation} from "./ui-actions";
import {queryDevice, queryDeviceId, queryDeviceParameterValue, queryHasDeviceParameterError} from "../selectors";
import SparkManager, {IServerResponse} from "../../managers/SparkManager";
import {delayPromise} from "../../utils/promise-utils";
import {
  recalculateDeviceId,
  setDeviceParameter,
  setDeviceParameterResponse,
  setOnlyTransientParameter,
  setParameters,
  updateDeviceIsProcessing,
  updateDeviceProcessStatus
} from "./atom-actions";
import {ConfigParam, MotorType, SensorType} from "../../models/dto";
import {forSelectedDevice} from "./action-creators";
import {
  ConfirmationAnswer,
  IDeviceTransientState,
  isDeviceNotConfigured,
  ProcessType,
  toDtoDeviceId,
  VirtualDeviceId
} from "../state";
import {MOTOR_TYPES} from "../dictionaries";
import {onSchedule} from "../../utils/redux-scheduler";
import {onError, useErrorHandler} from "./error-actions";
import {toConfigParamDefaultValue} from "../config-param-rules";
import {syncSignalDeviceId} from "./display-actions";

export const setParameterValue = (virtualDeviceId: VirtualDeviceId,
                                  param: ConfigParam,
                                  value: number): SparkAction<Promise<number>> =>
  (dispatch) => {
    const normalizedValue = toConfigParamDefaultValue(param, value);

    // Change device parameter value immediately for better UX
    dispatch(setDeviceParameter(virtualDeviceId, param, normalizedValue));

    // Set value for requested and all dependent parameters
    return dispatch(scheduleSetParameterValue(virtualDeviceId, param, normalizedValue));
  };

const scheduleSetParameterValue = (virtualDeviceId: VirtualDeviceId,
                                   param: ConfigParam,
                                   value: number): SparkAction<Promise<number>> =>
  onSchedule("set-parameter", virtualDeviceId, param, (dispatch, getState) => {
    // It is supposed that device parameter value was already changed, this way we pass the last parameter as false
    // This is done only for better UX
    const mainParameter = dispatch(setOnlyParameterValue(virtualDeviceId, param, value, false));

    // TODO: refactor to use getDependentParams and restore
    if (param === ConfigParam.kMotorType) {
      return mainParameter
        .then((mainValue) => {
          const motorType = queryDeviceParameterValue(getState(), virtualDeviceId, param);
          if (motorType === MotorType.Brushless) {
            return dispatch(setOnlyParameterValue(virtualDeviceId, ConfigParam.kSensorType, SensorType.HallSensor));
          } else {
            return Promise.resolve<number>(mainValue);
          }
        });
    }
    return mainParameter;
  });

export const setOnlyParameterValue = (virtualDeviceId: VirtualDeviceId,
                                      param: ConfigParam,
                                      newValue: number,
                                      // should we set parameter value or value was already set
                                      withInitialSet: boolean = true): SparkAction<Promise<number>> =>
  (dispatch, getState) => {
    if (withInitialSet) {
      const currentValue = queryDeviceParameterValue(getState(), virtualDeviceId, param);

      // Do nothing if value was not changed
      if (currentValue === newValue) {
        return Promise.resolve(currentValue);
      }

      dispatch(setDeviceParameter(virtualDeviceId, param, newValue));
    }

    // If value is invalid we should not send it into the device
    if (queryHasDeviceParameterError(getState(), virtualDeviceId, param)) {
      return Promise.resolve(newValue);
    }

    const device = queryDevice(getState(), virtualDeviceId);

    const deviceId = toDtoDeviceId(device.fullDeviceId);

    if (isDeviceNotConfigured(device) && param === ConfigParam.kCanID) {
      return SparkManager.idAssignment(newValue, device.uniqueId)
        .then(() => {
          // Generate server response, because validation logic can rely on response
          const res: IServerResponse = {status: 0, type: 1, requestValue: newValue, responseValue: newValue};
          dispatch(setDeviceParameterResponse(virtualDeviceId, param, res, true));
          dispatch(recalculateDeviceId(virtualDeviceId));
          return newValue;
        })
        .catch(useErrorHandler(dispatch));
    } else {
      return SparkManager.setAndGetParameter(deviceId, param, newValue)
        .then((res: IServerResponse) => {
          const responseValue = res.responseValue as number;
          dispatch(setDeviceParameterResponse(virtualDeviceId, param, res, res.responseValue !== res.requestValue));
          return responseValue;
        })
        .catch(onError((error) => {
          return SparkManager.getParameter(deviceId, param)
            .then((value) => dispatch(setDeviceParameter(virtualDeviceId, param, value)))
            .then(() => Promise.reject<number>(error))
            .catch(() => Promise.reject<number>(error));
        }))
        .then((value) => {
          if (param === ConfigParam.kCanID) {
            dispatch(recalculateDeviceId(virtualDeviceId));
            return dispatch(syncSignalDeviceId(virtualDeviceId)).then(() => value);
          } else {
            return value;
          }
        })
        .catch(useErrorHandler(dispatch));
    }
  };

export const loadParameters = (virtualDeviceId: VirtualDeviceId): SparkAction<Promise<void>> =>
  onSchedule("device-action", virtualDeviceId, (dispatch, getState) => {
    dispatch(updateDeviceIsProcessing(virtualDeviceId, true));
    dispatch(updateDeviceProcessStatus(virtualDeviceId, tt("lbl_status_getting_parameters")));

    return delayPromise(1000)
      .then(() => SparkManager.getConfigFromParams(toDtoDeviceId(queryDeviceId(getState(), virtualDeviceId)!)))
      .then((values) => {
        dispatch(updateDeviceProcessStatus(virtualDeviceId, ""));
        dispatch(updateDeviceIsProcessing(virtualDeviceId, false));
        dispatch(setParameters(virtualDeviceId, values))
      })
      .catch(onError(() => {
        dispatch(updateDeviceProcessStatus(virtualDeviceId, tt("lbl_status_failed_to_get_parameters")));
        dispatch(updateDeviceIsProcessing(virtualDeviceId, false));
      }))
      .catch(useErrorHandler(dispatch));
  });

export const burnConfiguration = (virtualDeviceId: VirtualDeviceId): SparkAction<Promise<void>> =>
  onSchedule("device-action", virtualDeviceId, (dispatch, getState) => {
    const motorType = queryDeviceParameterValue(getState(), virtualDeviceId, ConfigParam.kMotorType);
    const activeMotorType = MOTOR_TYPES.get(motorType);

    return dispatch(showConfirmation({
      intent: "success",
      text: tt("msg_update_configuration", { motorType: activeMotorType.text }),
      yesLabel: tt("lbl_yes_update"),
      cancelLabel: tt("lbl_cancel")
    })).then((answer) => {
      if (answer === ConfirmationAnswer.Cancel) {
        return;
      }

      const deviceId = queryDeviceId(getState(), virtualDeviceId)!;

      dispatch(updateDeviceProcessStatus(virtualDeviceId, tt("lbl_status_burning_parameters")));
      dispatch(updateDeviceIsProcessing(virtualDeviceId, true, ProcessType.Save));
      return SparkManager.burnFlash(toDtoDeviceId(deviceId))
        .then(() => delayPromise(1000))
        .then(() =>
          SparkManager.getConfigFromParams(toDtoDeviceId(deviceId)).then((values) => {
            dispatch(setParameters(virtualDeviceId, values));
          }))
        .catch(useErrorHandler(dispatch))
        .finally(() => {
          dispatch(updateDeviceProcessStatus(virtualDeviceId, ""));
          dispatch(updateDeviceIsProcessing(virtualDeviceId, false));
        });
    });
  });

export const resetConfiguration = (virtualDeviceId: VirtualDeviceId,
                                   fullWipe: boolean = false): SparkAction<Promise<void>> =>
  onSchedule("device-action", virtualDeviceId, (dispatch, getState) => {
    return dispatch(showConfirmation({
      intent: "warning",
      text: tt("msg_factory_reset_configuration"),
      yesLabel: tt("lbl_yes"),
      cancelLabel: tt("lbl_cancel"),
    })).then((answer) => {
      if (answer === ConfirmationAnswer.Cancel) {
        return;
      }

      dispatch(updateDeviceIsProcessing(virtualDeviceId, true, ProcessType.Reset));
      dispatch(updateDeviceProcessStatus(virtualDeviceId, tt("lbl_status_resetting")));

      const deviceId = queryDeviceId(getState(), virtualDeviceId)!;

      return SparkManager.restoreDefaults(toDtoDeviceId(deviceId), fullWipe)
        .then(() => {
          dispatch(updateDeviceProcessStatus(virtualDeviceId, tt("lbl_status_getting_parameters")));
          return delayPromise(1000);
        })
        .then(() =>
          SparkManager.getConfigFromParams(toDtoDeviceId(deviceId)).then((values) => {
            dispatch(setParameters(virtualDeviceId, values));
          }))
        .catch(useErrorHandler(dispatch))
        .finally(() => {
          dispatch(updateDeviceIsProcessing(virtualDeviceId, false));
          dispatch(updateDeviceProcessStatus(virtualDeviceId, ""));
        });
    });
  });

export const setTransientParameter = (virtualDeviceId: VirtualDeviceId,
                                      field: keyof IDeviceTransientState,
                                      value: any): SparkAction<Promise<any>> =>
  (dispatch) => {
    dispatch(setOnlyTransientParameter(virtualDeviceId, field, value));
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
