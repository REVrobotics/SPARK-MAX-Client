import {Slider} from "@blueprintjs/core";
import * as classNames from "classnames";
import * as React from "react";
import {useCallback} from "react";
import {INumericFieldConstraints, MessageSeverity} from "../../store/state";
import {IConfigParamProps} from "../config-param-props";

interface IProps extends IConfigParamProps {
  className?: string;
  constraints?: INumericFieldConstraints;
  stepSize?: number;
}

const SliderParamField = ({className, parameter, constraints, disabled, value, stepSize, message, onValueChange}: IProps) => {
  const onChange = useCallback((newValue) => onValueChange(parameter, newValue), []);

  const min = constraints ? constraints.min : Number.MIN_SAFE_INTEGER;
  const max = constraints ? constraints.max : Number.MAX_SAFE_INTEGER;

  const sliderClassName = classNames(className, {"field-error": message && message.severity === MessageSeverity.Error});

  return (
    <Slider initialValue={value} disabled={disabled} value={value} min={min} max={max} stepSize={stepSize}
            onChange={onChange} className={sliderClassName}/>
  );
};

export default SliderParamField;
