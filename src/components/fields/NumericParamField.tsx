import * as React from "react";
import {useCallback} from "react";
import {IFieldConstraints, INumericFieldConstraints} from "../../store/state";
import {getParameterId, IConfigParamProps} from "../config-param-props";
import {MessageSeverity} from "../../models/Message";
import SafeNumericInput from "../SafeNumericInput";

interface IProps extends IConfigParamProps {
  className?: string;
  constraints?: IFieldConstraints;
}

const NumericParamField = ({className, parameter, constraints, disabled, value, message, onValueChange}: IProps) => {
  const typedConstraints = constraints as INumericFieldConstraints;

  const min = typedConstraints ? typedConstraints.min : Number.MIN_VALUE;
  const max = typedConstraints ? typedConstraints.max : Number.MAX_VALUE;

  const onChange = useCallback((newValue) => onValueChange(parameter, newValue), []);

  return (
    <SafeNumericInput
      id={getParameterId(parameter)}
      value={value}
      onValueChange={onChange}
      min={min}
      max={max}
      disabled={disabled}
      className={`${message && message.severity === MessageSeverity.Error ? "field-error" : ""} ${className}`}
    />
  )
};

export default NumericParamField;
