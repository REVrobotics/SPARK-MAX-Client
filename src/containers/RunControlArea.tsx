import classNames from "classnames";
import {CONTROL_MODE_CONSTRAINTS, DEFAULT_DEVICE_RUN, IApplicationState, IDeviceRunState} from "../store/state";
import {connect} from "react-redux";
import {burnSelectedDeviceConfiguration, setSelectedDeviceParameterValue, SparkDispatch} from "../store/actions";
import * as React from "react";
import {Button, FormGroup, Intent, Slider} from "@blueprintjs/core";
import DictionarySelect from "../components/DictionarySelect";
import SafeNumericInput, {SafeNumericBehavior} from "../components/SafeNumericInput";
import {CONTROL_MODES} from "../store/dictionaries";
import {ConfigParam, CtrlType} from "../models/proto-gen/SPARK-MAX-Types_dto_pb";
import {
  queryHasAssignedSignalsForSelectedDevice,
  queryHasRunningDevices,
  querySelectedDeviceCurrentConfig,
  querySelectedDeviceRun
} from "../store/selectors";
import {
  sendSelectedDeviceControlValue,
  startSelectedDevice,
  stopAllDevices,
  stopSelectedDevice
} from "../store/actions/display-actions";
import {PlayCircleOutlineIcon, StopCircleRegularIcon, StopIcon} from "../icons";
import {getDeviceParamValueOrDefault} from "../store/param-rules/config-param-helpers";

interface IProps {
  className?: string;
  mode: CtrlType;
  run: IDeviceRunState;
  hasSignalsForSelectedDevice: boolean;
  hasRunningDevices: boolean;
  start(): void;
  stop(): void;
  stopAll(): void;
  onControlModeChange(type: CtrlType): void;
  onControlValueChange(value: any): void;
  burnConfiguration(): void;
}

/**
 * Component used on "Run" panel of "Run Tab". This components allows to manage
 * * running mode
 * * control mode
 * * `setpoint`
 */
const RunControlArea = (props: IProps) => {
  const {
    mode, hasRunningDevices, hasSignalsForSelectedDevice,
    start, stop, stopAll, run, burnConfiguration,
    onControlModeChange, onControlValueChange,
  } = props;

  const canStartSelectedDevice = hasSignalsForSelectedDevice;
  const canStopDevices = hasRunningDevices;

  return (
    <div className={classNames("flex-column", props.className)}>
      <div className="p-10 flex-row flex-center">
        <Button className="rev-btn main-control-btn"
                icon={run.running ? <StopCircleRegularIcon size={20}/> : <PlayCircleOutlineIcon size={20}/>}
                text={run.running ? tt("lbl_stop_device") : tt("lbl_start_device")}
                disabled={!canStartSelectedDevice}
                onClick={run.running ? stop : start}/>
        <Button className="ml-5"
                minimal={true}
                icon={<StopIcon/>}
                intent={canStopDevices ? Intent.DANGER : undefined}
                disabled={!canStopDevices}
                onClick={stopAll}
                title={tt("lbl_stop_all_tooltip")}
                text={tt("lbl_stop_all")}/>
      </div>
      <div className="control-area__field-list flex-1 flex-column flex-cross-center flex-space-between">
        <div className="flex-column">
          <FormGroup className="control-area__field-group" inline={true} label={tt("lbl_control_mode")}>
            <DictionarySelect value={mode} dictionary={CONTROL_MODES} onValueChange={onControlModeChange}/>
          </FormGroup>
          <FormGroup className="control-area__field-group" inline={true} label={tt("lbl_set_point")}>
            <SafeNumericInput
              min={CONTROL_MODE_CONSTRAINTS[mode].min}
              max={CONTROL_MODE_CONSTRAINTS[mode].max}
              minorStepSize={CONTROL_MODE_CONSTRAINTS[mode].minorStepSize}
              stepSize={CONTROL_MODE_CONSTRAINTS[mode].stepSize || 1}
              value={run.value}
              safeInvalidValue={run.value}
              safeBehavior={SafeNumericBehavior.ClampAndNoNan}
              onValueChange={onControlValueChange}/>
          </FormGroup>
          {
            mode === CtrlType.DutyCycle ?
              <Slider className="control-area__field-slider"
                      value={run.value}
                      min={CONTROL_MODE_CONSTRAINTS[mode].min}
                      max={CONTROL_MODE_CONSTRAINTS[mode].max}
                      stepSize={CONTROL_MODE_CONSTRAINTS[mode].stepSize || 1}
                      onChange={onControlValueChange}/>
              : null
          }
        </div>
        <Button className="rev-btn" text={tt("lbl_save_configuration")} onClick={burnConfiguration}/>
      </div>
    </div>
  );
};

const mapStateToProps = (state: IApplicationState) => {
  return {
    mode: getDeviceParamValueOrDefault(querySelectedDeviceCurrentConfig(state), ConfigParam.kCtrlType),
    run: querySelectedDeviceRun(state) || DEFAULT_DEVICE_RUN,
    hasSignalsForSelectedDevice: queryHasAssignedSignalsForSelectedDevice(state),
    hasRunningDevices: queryHasRunningDevices(state),
  };
};

const mapDispatchToProps = (dispatch: SparkDispatch) => {
  return {
    start: () => dispatch(startSelectedDevice()),
    stop: () => dispatch(stopSelectedDevice()),
    stopAll: () => dispatch(stopAllDevices()),
    onControlModeChange: (mode: CtrlType) => dispatch(setSelectedDeviceParameterValue(ConfigParam.kCtrlType, mode)),
    onControlValueChange: (value: number) => dispatch(sendSelectedDeviceControlValue(value)),
    burnConfiguration: () => dispatch(burnSelectedDeviceConfiguration()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(RunControlArea);
