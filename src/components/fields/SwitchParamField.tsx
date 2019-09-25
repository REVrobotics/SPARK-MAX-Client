import {Switch} from "@blueprintjs/core";
import {isFunction} from "lodash";
import * as React from "react";
import {useCallback} from "react";
import {IParamSourceProps} from "../param-source";

interface IProps extends IParamSourceProps {
  className?: string;
  label?: string | ((checked: boolean) => string);
  inverted?: boolean;
}

const SwitchParamField = ({label, inverted, className, parameter, disabled, value, onValueChange}: IProps) => {
  const checked = inverted ? 0 : 1;
  const unchecked = inverted ? 1 : 0;

  const onChange = useCallback(
    (event) => onValueChange(parameter, event.target.checked ? checked : unchecked),
    [inverted]);

  return (
    <Switch checked={value === checked}
            disabled={disabled}
            label={isFunction(label) ? label(value === checked) : label}
            className={className}
            onChange={onChange}/>
  )
};

export default SwitchParamField;
