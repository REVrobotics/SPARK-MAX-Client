import {IParamSourceProps} from "../../components/param-source";
import {ComponentType} from "react";
import {ConfigParam} from "../../models/ConfigParam";
import {connect} from "react-redux";
import {IApplicationState} from "../../store/state";
import {getConfigParamRule} from "../../store/config-param-rules";
import {setSelectedDeviceParameterValue, SparkDispatch} from "../../store/actions";
import {createRamConfigParamContext, getRamConfigParamRule} from "../../store/ram-config-param-rules";
import {querySelectedDeviceBurnedConfig} from "../../store/selectors";

interface IBindConfigParamProps {
  parameter: ConfigParam;
  disabled?: boolean;
}

/**
 * This HOC binds wrapped component to the requested configuration parameter using corresponding {@link ConfigParamRule}
 *
 * @param Component
 */
const bindRamConfigRule = (Component: ComponentType<IParamSourceProps>): ComponentType<any> => {
  const mapStateToProps = (state: IApplicationState, {parameter, disabled}: IBindConfigParamProps) => {
    const rule = getRamConfigParamRule(parameter);
    const ctx = createRamConfigParamContext(state);
    const value = rule.getValue(ctx);

    const burnedParameters = querySelectedDeviceBurnedConfig(state);

    return {
      parameter,
      constraints: rule.constraints,
      value: rule.fromRawValue(value),
      disabled: disabled || rule.isDisabled(ctx),
      isDirty: burnedParameters && burnedParameters[parameter] != null ? burnedParameters[parameter] !== value : false,
      message: rule.getMessage(ctx),
      options: rule.getOptions(ctx),
    };
  };

  const mapDispatchToProps = (dispatch: SparkDispatch, {parameter}: IBindConfigParamProps) => {
    const rule = getConfigParamRule(parameter);

    return {
      onValueChange: (_: ConfigParam, value: any) =>
        dispatch(setSelectedDeviceParameterValue(parameter, rule.toRawValue(value))),
    };
  };

  return connect(mapStateToProps, mapDispatchToProps)(Component);
};

export default bindRamConfigRule;
