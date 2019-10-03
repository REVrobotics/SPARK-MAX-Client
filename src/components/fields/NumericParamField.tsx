import {NumericInput} from "@blueprintjs/core";
import * as React from "react";
import {useCallback} from "react";
import {INumericFieldConstraints, MessageSeverity} from "../../store/state";
import {getParameterId, IParamSourceProps} from "../param-source";

interface IProps extends IParamSourceProps {
  className?: string;
  constraints?: INumericFieldConstraints;
}

const NumericParamField = ({className, parameter, constraints, disabled, value, message, onValueChange}: IProps) => {
  const onChange = useCallback((newValue) => onValueChange(parameter, newValue), []);

  const min = constraints ? constraints.min : Number.MIN_SAFE_INTEGER;
  const max = constraints ? constraints.max : Number.MAX_SAFE_INTEGER;

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
