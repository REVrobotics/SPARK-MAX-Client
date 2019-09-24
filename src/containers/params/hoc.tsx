import {IParamSourceProps} from "../../components/param-source";
import {ComponentType} from "react";
import {ConfigParam} from "../../models/ConfigParam";
import {connect} from "react-redux";
import {IApplicationState} from "../../store/state";
import {getConfigParamRule} from "../../store/config-param-rules";
import {setSelectedDeviceParameterValue, SparkDispatch} from "../../store/actions";

interface IHocProps {
  parameter: ConfigParam;
  disabled?: boolean;
}

const hoc = (Component: ComponentType<IParamSourceProps>): ComponentType<any> => {
  const mapStateToProps = (state: IApplicationState, {parameter, disabled}: IHocProps) => {
    const rule = getConfigParamRule(parameter);

    return {
      parameter,
      title: rule.getTitle(state),
      constraints: rule.getConstraints(state),
      value: rule.fromRawValue(rule.getValue(state)),
      disabled: disabled || rule.isDisabled(state),
      isDirty: rule.isDirty(state),
      hasError: rule.hasError(state),
      errorText: rule.getErrorText(state),
      hasWarning: rule.hasWarning(state),
      warningText: rule.getWarningText(state),
      options: rule.getOptions(state),
    };
  };

  const mapDispatchToProps = (dispatch: SparkDispatch, {parameter}: IHocProps) => {
    const rule = getConfigParamRule(parameter);

    return {
      onValueChange: (_: ConfigParam, value: any) =>
        dispatch(setSelectedDeviceParameterValue(parameter, rule.toRawValue(value))),
    };
  };

  return connect(mapStateToProps, mapDispatchToProps)(Component);
};

export default hoc;
