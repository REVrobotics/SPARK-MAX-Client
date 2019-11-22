import * as React from "react";
import {useCallback} from "react";
import {IFieldConstraints, INumericFieldConstraints} from "../../store/state";
import {getParameterId, IConfigParamProps} from "../config-param-props";
import {MessageSeverity} from "../../models/Message";
import SafeNumericInput, {SafeNumericBehavior} from "../SafeNumericInput";
import {INumericInputProps} from "@blueprintjs/core";

interface IProps extends IConfigParamProps {
  className?: string;
  constraints?: IFieldConstraints;
  inputProps?: INumericInputProps & {safeBehavior?: SafeNumericBehavior};
}

const NumericParamField = ({
                             className, parameter, constraints, disabled, value, message,
                             onValueChange, inputProps,
                           }: IProps) => {
  const typedConstraints = constraints as INumericFieldConstraints;

  const min = typedConstraints ? typedConstraints.min : Number.MIN_VALUE;
  const max = typedConstraints ? typedConstraints.max : Number.MAX_VALUE;
  const stepSize = (typedConstraints ? typedConstraints.stepSize : undefined) || 1;
  const minorStepSize = stepSize < 1 ? stepSize : undefined;

  const onChange = useCallback((newValue) => onValueChange(parameter, newValue), [parameter]);

  return (
    <SafeNumericInput
      id={getParameterId(parameter)}
      {...inputProps}
      value={value}
      onValueChange={onChange}
      min={min}
      max={max}
      stepSize={stepSize}
      minorStepSize={minorStepSize}
      disabled={disabled}
      className={`${message && message.severity === MessageSeverity.Error ? "field-error" : ""} ${className}`}
    />
  )
};

export default NumericParamField;
