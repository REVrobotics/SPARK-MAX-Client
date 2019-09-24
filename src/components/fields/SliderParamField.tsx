import {Slider} from "@blueprintjs/core";
import * as classNames from "classnames";
import * as React from "react";
import {useCallback} from "react";
import {INumericFieldConstraints} from "../../store/state";
import {IParamSourceProps} from "../param-source";

interface IProps extends IParamSourceProps {
  className?: string;
  constraints?: INumericFieldConstraints;
  stepSize?: number;
}

const SliderParamField = ({className, parameter, constraints, disabled, value, stepSize, hasError, onValueChange}: IProps) => {
  const onChange = useCallback((newValue) => onValueChange(parameter, newValue), []);

  const min = constraints ? constraints.min : Number.MIN_SAFE_INTEGER;
  const max = constraints ? constraints.max : Number.MAX_SAFE_INTEGER;

  const sliderClassName = classNames(className, {"field-error": hasError});

  return (
    <Slider initialValue={value} disabled={disabled} value={value} min={min} max={max} stepSize={stepSize}
            onChange={onChange} className={sliderClassName}/>
  );
};

export default SliderParamField;
