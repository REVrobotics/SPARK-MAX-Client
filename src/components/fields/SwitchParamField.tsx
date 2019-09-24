import {Switch} from "@blueprintjs/core";
import {isFunction} from "lodash";
import * as React from "react";
import {useCallback} from "react";
import {IParamSourceProps} from "../param-source";

interface IProps extends IParamSourceProps {
  className?: string;
  label?: string | ((checked: boolean) => string);
}

const SwitchParamField = ({label, className, parameter, disabled, value, onValueChange}: IProps) => {
  const onChange = useCallback((event) => onValueChange(parameter, event.target.checked ? 1 : 0), []);

  return (
    <Switch checked={value === 1}
            disabled={disabled}
            label={isFunction(label) ? label(value === 1) : label}
            className={className}
            onChange={onChange}/>
  )
};

export default SwitchParamField;
