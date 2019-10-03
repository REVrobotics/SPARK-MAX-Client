import {Button, FormGroup, Switch} from "@blueprintjs/core";
import * as React from "react";
import {connect} from "react-redux";
import {IApplicationState, IDeviceTransientState, ProcessType} from "../store/state";
import {ConfigParam} from "../models/ConfigParam";
import {
  burnSelectedDeviceConfiguration,
  resetSelectedDeviceConfiguration,
  setSelectedDeviceTransientParameter,
  SparkDispatch
} from "../store/actions";
import {ConfigurationSelect} from "../components/ConfigurationSelect";
import {
  querySelectedDeviceProcessType,
  querySelectedDeviceTransientParameters,
  queryIsSelectedDeviceConnected,
  queryIsSelectedDeviceInProcessing,
  queryIsSelectedDeviceLoaded,
  queryIsSelectedDeviceInvalid,
  queryIsSelectedDeviceNotConfigured
} from "../store/selectors";
import NumericParamField from "../components/fields/NumericParamField";
import ValidationFormGroup from "../components/groups/ValidationFormGroup";
import {getParameterId, IParamSourceProps} from "../components/param-source";
import bindRamConfigRule from "./params/bind-ram-config-rule";
import SelectParamField from "../components/fields/SelectParamField";
import {withDirty} from "../components/groups/with-dirty";
import SwitchParamField from "../components/fields/SwitchParamField";
import SliderParamField from "../components/fields/SliderParamField";

interface IBasicFormGroupProps extends IParamSourceProps {
  groupClassName?: string;
  fieldClassName?: string;
}

type IBasicNumericFieldGroupProps = IBasicFormGroupProps;

interface IBasicSelectFieldGroupProps extends IBasicFormGroupProps {
  placeholder?: string;
}

interface IBasicSwitchFieldFitGroupProps extends IBasicFormGroupProps {
  title?: string;
}

interface IBasicSwitchFieldGroupProps extends IBasicFormGroupProps {
  label: string|((checked: boolean) => string);
  inverted?: boolean;
}

interface IBasicSliderFieldGroupProps extends IBasicFormGroupProps {
  stepSize: number;
}

const BASIC_PARAM_TITLES = {
  [ConfigParam.kCanID]: "CAN ID",
  [ConfigParam.kMotorType]: "Select Motor Type",
  [ConfigParam.kSensorType]: "Sensor Type",
  [ConfigParam.kIdleMode]: "Idle Mode",
  [ConfigParam.kInputDeadband]: "PWM Input Deadband",
  [ConfigParam.kRampRate]: "Rate (seconds to full speed)",
  [ConfigParam.kSmartCurrentStallLimit]: "Smart Current Limit",
  [ConfigParam.kEncoderCountsPerRev]: "Encoder CPR",
  [ConfigParam.kHardLimitFwdEn]: "Forward Limit",
  [ConfigParam.kHardLimitRevEn]: "Reverse Limit",
  [ConfigParam.kSoftLimitFwdEn]: "Forward Limit",
  [ConfigParam.kSoftLimitRevEn]: "Reverse Limit",
  [ConfigParam.kSoftLimitFwd]: "Forward Limit (value)",
  [ConfigParam.kSoftLimitRev]: "Reverse Limit (value)",
};

const DirtySwitchParamField = withDirty(SwitchParamField);
const DirtyValidationFormGroup = withDirty(ValidationFormGroup);

const BasicNumericFieldGroup = bindRamConfigRule((props: IBasicNumericFieldGroupProps) => {
  const {groupClassName, fieldClassName, ...otherProps} = props;

  return (
    <DirtyValidationFormGroup {...otherProps} title={BASIC_PARAM_TITLES[props.parameter]} className={groupClassName}>
      <NumericParamField {...otherProps} className={fieldClassName}/>
    </DirtyValidationFormGroup>
  );
});

const BasicSelectFieldGroup = bindRamConfigRule((props: IBasicSelectFieldGroupProps) => {
  const {groupClassName, fieldClassName, placeholder, ...otherProps} = props;

  return (
    <DirtyValidationFormGroup {...otherProps} title={BASIC_PARAM_TITLES[props.parameter]} className={groupClassName}>
      <SelectParamField {...otherProps} placeholder={placeholder} className={fieldClassName}/>
    </DirtyValidationFormGroup>
  );
});

const BasicSwitchField = bindRamConfigRule(DirtySwitchParamField);

const BasicSwitchLabelessFieldGroup = bindRamConfigRule((props: IBasicSwitchFieldFitGroupProps) => {
  const {groupClassName, fieldClassName, title, ...otherProps} = props;

  return (
    <FormGroup className={groupClassName} labelFor={getParameterId(props.parameter)}>
      <DirtySwitchParamField {...otherProps} className={fieldClassName} label={title}/>
    </FormGroup>
  );
});

const BasicSwitchFieldGroup = bindRamConfigRule((props: IBasicSwitchFieldGroupProps) => {
  const {groupClassName, fieldClassName, label, inverted, ...otherProps} = props;

  return (
    <DirtyValidationFormGroup {...otherProps} title={BASIC_PARAM_TITLES[props.parameter]} className={groupClassName}>
      <SwitchParamField {...otherProps} className={fieldClassName} label={label} inverted={inverted}/>
    </DirtyValidationFormGroup>
  );
});

const BasicSliderFieldGroup = bindRamConfigRule((props: IBasicSliderFieldGroupProps) => {
  const {groupClassName, fieldClassName, stepSize, ...otherProps} = props;

  return (
    <DirtyValidationFormGroup {...otherProps} title={BASIC_PARAM_TITLES[props.parameter]} className={groupClassName}>
      <SliderParamField {...otherProps} className={fieldClassName} stepSize={stepSize}/>
    </DirtyValidationFormGroup>
  );
});

const polarityLabelFn = (checked: boolean) => checked ? "Normally Closed" : "Normally Open";
const idleModeLabelFn = (checked: boolean) => checked ? "Coast" : "Brake";

interface IProps {
  enabled: boolean;
  blocked: boolean;
  processType?: ProcessType;
  transient: IDeviceTransientState;

  burnConfiguration(): void;

  resetConfiguration(): void;

  setTransientParameter(field: keyof IDeviceTransientState, value: any): void;
}

class BasicTab extends React.Component<IProps> {
  private onChangeRampRateEnabled = () => {
    this.props.setTransientParameter("rampRateEnabled", !this.props.transient.rampRateEnabled);
  };

  public render() {
    const {enabled, blocked, processType, transient: {rampRateEnabled}} = this.props;

    const canEditCanId = enabled;
    const canEditOtherFields = enabled && !blocked;
    const canSave = enabled && !blocked;

    return (
      <div>
        <div className="form form-left">
          <FormGroup
            label="Select Configuration"
            labelFor="configuration-id"
            className="form-group-half"
          >
            <ConfigurationSelect disabled={!canEditOtherFields}/>
          </FormGroup>
          <BasicNumericFieldGroup parameter={ConfigParam.kCanID}
                                  disabled={!canEditCanId}
                                  groupClassName="form-group-quarter"/>
        </div>
        <div className="form">
          <BasicSelectFieldGroup parameter={ConfigParam.kMotorType}
                                 disabled={!canEditOtherFields}
                                 groupClassName="form-group-half"/>
          <BasicSwitchFieldGroup parameter={ConfigParam.kIdleMode}
                                 disabled={!canEditOtherFields}
                                 groupClassName="form-group-quarter"
                                 inverted={true}
                                 label={idleModeLabelFn}/>
          <BasicNumericFieldGroup parameter={ConfigParam.kSmartCurrentStallLimit}
                                  disabled={!canEditOtherFields}
                                  groupClassName="form-group-quarter no-wrap"/>
        </div>
        <div className="form form-space-between">
          <BasicSelectFieldGroup parameter={ConfigParam.kSensorType}
                                 disabled={!canEditOtherFields}
                                 groupClassName="form-group-quarter"/>
          <BasicNumericFieldGroup parameter={ConfigParam.kEncoderCountsPerRev}
                                  disabled={!canEditOtherFields}
                                  groupClassName="form-group-quarter"/>
          <BasicSliderFieldGroup parameter={ConfigParam.kInputDeadband}
                                 disabled={!canEditOtherFields}
                                 groupClassName="form-group-half"
                                 stepSize={0.01}/>
        </div>
        <div className="form form-top form-space-between">
          <div className="form-column form-column-third no-wrap">
            <h4 className="form-title">Limit Switch</h4>
            <div className="form-control-group">
              <BasicSwitchField parameter={ConfigParam.kHardLimitFwdEn}
                                disabled={!canEditOtherFields}
                                label="Forward Limit"/>
              <BasicSwitchField parameter={ConfigParam.kLimitSwitchFwdPolarity}
                                disabled={!canEditOtherFields}
                                label={polarityLabelFn}/>
            </div>

            <div className="form-control-group">
              <BasicSwitchField parameter={ConfigParam.kHardLimitRevEn}
                                disabled={!canEditOtherFields}
                                label="Reverse Limit"/>
              <BasicSwitchField parameter={ConfigParam.kLimitSwitchRevPolarity}
                                disabled={!canEditOtherFields}
                                label={polarityLabelFn}/>
            </div>
          </div>
          <div className="form-column form-column-third no-wrap">
            <h4 className="form-title">Soft Limits</h4>

            <BasicSwitchLabelessFieldGroup parameter={ConfigParam.kSoftLimitFwdEn}
                                           disabled={!canEditOtherFields}
                                           groupClassName="form-group-fit"/>
            <BasicNumericFieldGroup parameter={ConfigParam.kSoftLimitFwd}
                                    disabled={!canEditOtherFields}/>

            <BasicSwitchLabelessFieldGroup parameter={ConfigParam.kSoftLimitRevEn}
                                           disabled={!canEditOtherFields}
                                           groupClassName="form-group-fit"/>
            <BasicNumericFieldGroup parameter={ConfigParam.kSoftLimitRev}
                                    disabled={!canEditOtherFields}/>
          </div>
          <div className="form-column form-column-third">
            <h4 className="form-title">Ramp Rate</h4>
            <FormGroup className="form-group-fit" labelFor="rampRateEnabled">
              <Switch id="rampRateEnabled"
                      checked={rampRateEnabled}
                      disabled={!canEditOtherFields}
                      label={rampRateEnabled ? "Enabled" : "Disabled"}
                      onChange={this.onChangeRampRateEnabled}/>
            </FormGroup>
            <BasicNumericFieldGroup parameter={ConfigParam.kRampRate}
                                    disabled={!canEditOtherFields || !rampRateEnabled}/>
          </div>
        </div>
        <div className="form update-container">
          <Button className="rev-btn"
                  disabled={!canSave || processType === ProcessType.Reset}
                  loading={processType === ProcessType.Save}
                  onClick={this.props.burnConfiguration}>Save Configuration</Button>
          <Button className="bad-btn"
                  disabled={!enabled || processType === ProcessType.Save}
                  loading={processType === ProcessType.Reset}
                  onClick={this.props.resetConfiguration}>Restore Factory Defaults</Button>
        </div>
      </div>
    );
  }
}

export function mapStateToProps(state: IApplicationState) {
  return {
    enabled: queryIsSelectedDeviceConnected(state)
      && !queryIsSelectedDeviceInProcessing(state)
      && queryIsSelectedDeviceLoaded(state),
    blocked: queryIsSelectedDeviceInvalid(state) || queryIsSelectedDeviceNotConfigured(state),
    processType: querySelectedDeviceProcessType(state),
    transient: querySelectedDeviceTransientParameters(state),
  };
}

export function mapDispatchToProps(dispatch: SparkDispatch) {
  return {
    burnConfiguration: () => dispatch(burnSelectedDeviceConfiguration()),
    resetConfiguration: () => dispatch(resetSelectedDeviceConfiguration()),
    setTransientParameter: (field: keyof IDeviceTransientState, value: any) =>
      dispatch(setSelectedDeviceTransientParameter(field, value)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(BasicTab);
