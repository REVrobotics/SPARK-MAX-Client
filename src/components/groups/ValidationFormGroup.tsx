import {FormGroup} from "@blueprintjs/core";
import PopoverHelp from "../PopoverHelp";
import * as React from "react";
import {getParameterId, IParamSourceProps} from "../param-source";
import {ConfigParamMessageSeverity} from "../../store/param-rules/ConfigParamRule";

interface IProps extends IParamSourceProps {
  className?: string;
  children: JSX.Element;
}

/**
 * This component serves as wrapper that adds validation logic to the {@link FormGroup}.
 */
const ValidationFormGroup = ({parameter, className, title, hasError, errorText, hasWarning, warningText, children}: IProps) => {
  const noMessage = (!hasError || !errorText) && (!hasWarning || !warningText);
  const messageText = errorText || warningText || "";
  const severity = hasError ? ConfigParamMessageSeverity.Error : ConfigParamMessageSeverity.Warning;
  return (
    <FormGroup
      label={<PopoverHelp enabled={noMessage} title={title || ""} content={messageText} severity={severity}/>}
      className={className}
      labelFor={getParameterId(parameter)}
    >{children}</FormGroup>
  )
};

export default ValidationFormGroup;
