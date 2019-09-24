import {FormGroup} from "@blueprintjs/core";
import PopoverHelp from "../PopoverHelp";
import * as React from "react";
import {getParameterId, IParamSourceProps} from "../param-source";

interface IProps extends IParamSourceProps {
  className?: string;
  children: JSX.Element;
}

const ValidationFormGroup = ({parameter, className, title, hasError, errorText, children}: IProps) => {
  return (
    <FormGroup
      label={<PopoverHelp enabled={!hasError || !errorText} title={title || ""} content={errorText || ""}/>}
      className={className}
      labelFor={getParameterId(parameter)}
    >{children}</FormGroup>
  )
};

export default ValidationFormGroup;
