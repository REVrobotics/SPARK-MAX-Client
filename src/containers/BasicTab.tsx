import {Button, FormGroup, Switch} from "@blueprintjs/core";
import * as React from "react";
import {connect} from "react-redux";
import classNames from "classnames";
import {IApplicationState, IDeviceTransientState, ProcessType} from "../store/state";
import {ConfigParam} from "../models/ConfigParam";
import {
  burnSelectedDeviceConfiguration,
  resetSelectedDeviceConfiguration,
  setSelectedDeviceTransientParameter,
  SparkDispatch
} from "../store/actions";
import {
  queryIsSelectedDeviceBlocked,
  queryIsSelectedDeviceEnabled,
  querySelectedDeviceProcessType,
  querySelectedDeviceTransientParameters
} from "../store/selectors";
import NumericParamField from "../components/fields/NumericParamField";
import ValidationFormGroup from "../components/groups/ValidationFormGroup";
import {getParameterId, IConfigParamProps} from "../components/config-param-props";
import bindRamConfigRule from "../hocs/bind-ram-config-rule";
import SelectParamField from "../components/fields/SelectParamField";
import {withDirty} from "../hocs/with-dirty";
import SwitchParamField from "../components/fields/SwitchParamField";
import SliderParamField from "../components/fields/SliderParamField";
import ConfigurationSelect from "./ConfigurationSelect";
import {DictionaryName, translateWord} from "../mls/dictionaries";

interface IBasicFormGroupProps extends IConfigParamProps {
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

const getBasicParamTitle = (param: ConfigParam) => translateWord(DictionaryName.ConfigParams, param);

const DirtySwitchParamField = withDirty(SwitchParamField);
const DirtyValidationFormGroup = withDirty(ValidationFormGroup);

const BasicNumericFieldGroup = bindRamConfigRule((props: IBasicNumericFieldGroupProps) => {
  const {groupClassName, fieldClassName, ...otherProps} = props;

  return (
    <DirtyValidationFormGroup {...otherProps} title={getBasicParamTitle(props.parameter)} className={groupClassName}>
      <NumericParamField {...otherProps} className={classNames("numeric-form-field", fieldClassName)}/>
    </DirtyValidationFormGroup>
  );
});

const BasicSelectFieldGroup = bindRamConfigRule((props: IBasicSelectFieldGroupProps) => {
  const {groupClassName, fieldClassName, placeholder, ...otherProps} = props;

  return (
    <DirtyValidationFormGroup {...otherProps} title={getBasicParamTitle(props.parameter)} className={groupClassName}>
      <SelectParamField {...otherProps} placeholder={placeholder} className={classNames("select-form-field", fieldClassName)}/>
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
    <DirtyValidationFormGroup {...otherProps} title={getBasicParamTitle(props.parameter)} className={groupClassName}>
      <SwitchParamField {...otherProps} className={fieldClassName} label={label} inverted={inverted}/>
    </DirtyValidationFormGroup>
  );
});

const BasicSliderFieldGroup = bindRamConfigRule((props: IBasicFormGroupProps) => {
  const {groupClassName, fieldClassName, ...otherProps} = props;

  return (
    <DirtyValidationFormGroup {...otherProps} title={getBasicParamTitle(props.parameter)} className={groupClassName}>
      <SliderParamField {...otherProps} className={fieldClassName}/>
    </DirtyValidationFormGroup>
  );
});

const polarityLabelFn = (checked: boolean) => checked ? tt("lbl_normally_closed") : tt("lbl_normally_open");
const idleModeLabelFn = (checked: boolean) => checked ? tt("lbl_coast") : tt("lbl_brake");

interface IProps {
  enabled: boolean;
  blocked: boolean;
  processType?: ProcessType;
  transient: IDeviceTransientState;

  onBurn(): void;

  onReset(): void;

  onSetTransientParameter(field: keyof IDeviceTransientState, value: any): void;
}

class BasicTab extends React.Component<IProps> {
  private onChangeRampRateEnabled = () => {
    this.props.onSetTransientParameter("rampRateEnabled", !this.props.transient.rampRateEnabled);
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
            label={tt("lbl_select_configuration")}
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
                                 groupClassName="form-group-half"/>
        </div>
        <div className="form form-top form-space-between">
          <div className="form-column form-column-third no-wrap">
            <h4 className="form-title">{tt("lbl_limit_switch")}</h4>
            <div className="form-control-group">
              <BasicSwitchField parameter={ConfigParam.kHardLimitFwdEn}
                                disabled={!canEditOtherFields}
                                label={tt("lbl_forward_limit")}/>
              <BasicSwitchField parameter={ConfigParam.kLimitSwitchFwdPolarity}
                                disabled={!canEditOtherFields}
                                label={polarityLabelFn}/>
            </div>

            <div className="form-control-group">
              <BasicSwitchField parameter={ConfigParam.kHardLimitRevEn}
                                disabled={!canEditOtherFields}
                                label={tt("lbl_reverse_limit")}/>
              <BasicSwitchField parameter={ConfigParam.kLimitSwitchRevPolarity}
                                disabled={!canEditOtherFields}
                                label={polarityLabelFn}/>
            </div>
          </div>
          <div className="form-column form-column-third no-wrap">
            <h4 className="form-title">{tt("lbl_soft_limits")}</h4>

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
            <h4 className="form-title">{tt("lbl_ramp_rate")}</h4>
            <FormGroup className="form-group-fit" labelFor="rampRateEnabled">
              <Switch id="rampRateEnabled"
                      checked={rampRateEnabled}
                      disabled={!canEditOtherFields}
                      label={rampRateEnabled ? tt("lbl_enabled") : tt("lbl_disabled")}
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
                  onClick={this.props.onBurn}>{tt("lbl_save_configuration")}</Button>
          <Button className="bad-btn"
                  disabled={!enabled || processType === ProcessType.Save}
                  loading={processType === ProcessType.Reset}
                  onClick={this.props.onReset}>{tt("lbl_restore_factory_defaults")}</Button>
        </div>
      </div>
    );
  }
}

export function mapStateToProps(state: IApplicationState) {
  return {
    enabled: queryIsSelectedDeviceEnabled(state),
    blocked: queryIsSelectedDeviceBlocked(state),
    processType: querySelectedDeviceProcessType(state),
    transient: querySelectedDeviceTransientParameters(state),
  };
}

export function mapDispatchToProps(dispatch: SparkDispatch) {
  return {
    onBurn: () => dispatch(burnSelectedDeviceConfiguration()),
    onReset: () => dispatch(resetSelectedDeviceConfiguration()),
    onSetTransientParameter: (field: keyof IDeviceTransientState, value: any) =>
      dispatch(setSelectedDeviceTransientParameter(field, value)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(BasicTab);
