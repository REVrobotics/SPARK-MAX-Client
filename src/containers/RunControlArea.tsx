import classNames from "classnames";
import {
  CONTROL_MODE_CONSTRAINTS,
  ControlField,
  DEFAULT_DEVICE_RUN,
  IApplicationState,
  IDeviceRunState
} from "../store/state";
import {connect} from "react-redux";
import {burnSelectedDeviceConfiguration, SparkDispatch} from "../store/actions";
import * as React from "react";
import {useCallback} from "react";
import {Button, FormGroup, Slider} from "@blueprintjs/core";
import DictionarySelect from "../components/DictionarySelect";
import SafeNumericInput, {SafeNumericBehavior} from "../components/SafeNumericInput";
import {CONTROL_MODES} from "../store/dictionaries";
import {CtrlType} from "../models/proto-gen/SPARK-MAX-Types_dto_pb";
import {
  queryHasAssignedSignalsForSelectedDevice,
  queryHasRunningDevices,
  querySelectedDeviceRun
} from "../store/selectors";
import {
  sendSelectedDeviceControlField,
  startSelectedDevice,
  stopAllDevices,
  stopSelectedDevice
} from "../store/actions/display-actions";
import {PlayCircleOutlineIcon, StopCircleRegularIcon, StopIcon} from "../icons";

interface IProps {
  className?: string;
  run: IDeviceRunState;
  hasSignalsForSelectedDevice: boolean;
  hasRunningDevices: boolean;
  start(): void;
  stop(): void;
  stopAll(): void;
  onControlFieldChange(name: ControlField, value: any): void;
  burnConfiguration(): void;
}

const RunControlArea = (props: IProps) => {
  const {
    hasRunningDevices, hasSignalsForSelectedDevice,
    start, stop, stopAll, run, burnConfiguration,
  } = props;

  const modeChange = useCallback((mode: CtrlType) => props.onControlFieldChange("mode", mode), []);
  const valueChange = useCallback((value: number) => props.onControlFieldChange("value", value), []);

  const canStartSelectedDevice = hasSignalsForSelectedDevice;
  const canStopDevices = hasRunningDevices;

  return (
    <div className={classNames("flex-column", props.className)}>
      <div className="control-area__button-list flex-row flex-center">
        <Button minimal={true}
                icon={run.running ? <StopCircleRegularIcon/> : <PlayCircleOutlineIcon/>}
                title={run.running ? tt("lbl_stop_device") : tt("lbl_start_device")}
                disabled={!canStartSelectedDevice}
                onClick={run.running ? stop : start}/>
        <Button minimal={true}
                icon={<StopIcon/>}
                title={tt("lbl_stop_devices")}
                disabled={!canStopDevices}
                onClick={stopAll}/>
      </div>
      <div className="control-area__field-list flex-1 flex-column flex-cross-center flex-space-between">
        <div className="flex-column">
          <FormGroup className="control-area__field-group" inline={true} label={tt("lbl_control_mode")}>
            <DictionarySelect value={run.mode} dictionary={CONTROL_MODES} onValueChange={modeChange}/>
          </FormGroup>
          <FormGroup className="control-area__field-group" inline={true} label={tt("lbl_set_point")}>
            <SafeNumericInput
              min={CONTROL_MODE_CONSTRAINTS[run.mode].min}
              max={CONTROL_MODE_CONSTRAINTS[run.mode].max}
              minorStepSize={CONTROL_MODE_CONSTRAINTS[run.mode].minorStepSize}
              stepSize={CONTROL_MODE_CONSTRAINTS[run.mode].stepSize || 1}
              value={run.value}
              safeInvalidValue={run.value}
              safeBehavior={SafeNumericBehavior.Clamp}
              onValueChange={valueChange}/>
          </FormGroup>
          {
            run.mode === CtrlType.DutyCycle ?
              <Slider className="control-area__field-slider"
                      value={run.value}
                      min={CONTROL_MODE_CONSTRAINTS[run.mode].min}
                      max={CONTROL_MODE_CONSTRAINTS[run.mode].max}
                      stepSize={CONTROL_MODE_CONSTRAINTS[run.mode].stepSize || 1}
                      onChange={valueChange}/>
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
    onControlFieldChange: (name: ControlField, value: any) => dispatch(sendSelectedDeviceControlField(name, value)),
    burnConfiguration: () => dispatch(burnSelectedDeviceConfiguration()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(RunControlArea);
