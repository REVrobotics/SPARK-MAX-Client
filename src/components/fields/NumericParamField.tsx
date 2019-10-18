import {NumericInput} from "@blueprintjs/core";
import * as React from "react";
import {useCallback} from "react";
import {IFieldConstraints, INumericFieldConstraints} from "../../store/state";
import {getParameterId, IConfigParamProps} from "../config-param-props";
import {MessageSeverity} from "../../models/Message";

interface IProps extends IConfigParamProps {
  className?: string;
  constraints?: IFieldConstraints;
}

const NumericParamField = ({className, parameter, constraints, disabled, value, message, onValueChange}: IProps) => {
  const onChange = useCallback((newValue) => onValueChange(parameter, newValue), []);

  const typedConstraints = constraints as INumericFieldConstraints;

  const min = typedConstraints ? typedConstraints.min : Number.MIN_SAFE_INTEGER;
  const max = typedConstraints ? typedConstraints.max : Number.MAX_SAFE_INTEGER;

  return (
    <NumericInput
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
