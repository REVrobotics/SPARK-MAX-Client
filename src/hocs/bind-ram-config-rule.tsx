import {defaults} from "lodash";
import {IConfigParamProps} from "../components/config-param-props";
import {ComponentType} from "react";
import {ConfigParam} from "../models/ConfigParam";
import {connect} from "react-redux";
import {IApplicationState, IFieldConstraints} from "../store/state";
import {setSelectedDeviceParameterValue, SparkDispatch} from "../store/actions";
import {createRamConfigParamContext, getRamConfigParamRule} from "../store/ram-config-param-rules";
import {querySelectedDeviceBurnedConfig} from "../store/selectors";

interface IBindRamConfigParamProps {
  parameter: ConfigParam;
  disabled?: boolean;
  constraints?: IFieldConstraints;
}

/**
 * This HOC binds wrapped component to the requested parameter
 */
function bindRamConfigRule<T>(Component: ComponentType<T & IConfigParamProps>): ComponentType<any> {

  const mapStateToProps = (state: IApplicationState,
                           {parameter, disabled, constraints}: T & IBindRamConfigParamProps) => {
    const rule = getRamConfigParamRule(parameter);
    const ctx = createRamConfigParamContext(state);
    const value = rule.getValue(ctx);

    const burnedParameters = querySelectedDeviceBurnedConfig(state);

    return {
      parameter,
      constraints: constraints ? defaults({}, constraints, rule.constraints) : rule.constraints,
      value: rule.fromRawValue(value),
      disabled: disabled || rule.isDisabled(ctx),
      isDirty: burnedParameters && burnedParameters[parameter] != null ? burnedParameters[parameter] !== value : false,
      message: rule.getMessage(ctx),
      options: rule.getOptions(ctx),
    };
  };

  const mapDispatchToProps = (dispatch: SparkDispatch, {parameter}: T & IBindRamConfigParamProps) => {
    const rule = getRamConfigParamRule(parameter);

    return {
      onValueChange: (_: ConfigParam, value: any) =>
        dispatch(setSelectedDeviceParameterValue(parameter, rule.toRawValue(value))),
    };
  };

  return connect(mapStateToProps, mapDispatchToProps)(Component as any) as any;
}

export default bindRamConfigRule;
