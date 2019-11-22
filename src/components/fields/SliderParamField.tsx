import {Slider} from "@blueprintjs/core";
import * as classNames from "classnames";
import * as React from "react";
import {useCallback} from "react";
import {IFieldConstraints, INumericFieldConstraints} from "../../store/state";
import {IConfigParamProps} from "../config-param-props";
import {MessageSeverity} from "../../models/Message";

interface IProps extends IConfigParamProps {
  className?: string;
  constraints?: IFieldConstraints;
}

const SliderParamField = ({className, parameter, constraints, disabled, value, message, onValueChange}: IProps) => {
  const onChange = useCallback((newValue) => onValueChange(parameter, newValue), [parameter]);

  const typedConstraints = constraints as INumericFieldConstraints;

  const min = typedConstraints ? typedConstraints.min : Number.MIN_SAFE_INTEGER;
  const max = typedConstraints ? typedConstraints.max : Number.MAX_SAFE_INTEGER;
  const stepSize = typedConstraints ? typedConstraints.stepSize : undefined;

  const sliderClassName = classNames(className, {"field-error": message && message.severity === MessageSeverity.Error});

  return (
    <Slider initialValue={value} disabled={disabled} value={value} min={min} max={max} stepSize={stepSize}
            onChange={onChange} className={sliderClassName}/>
  );
};

export default SliderParamField;
