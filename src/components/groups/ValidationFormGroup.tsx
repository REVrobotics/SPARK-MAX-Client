import {FormGroup} from "@blueprintjs/core";
import PopoverHelp from "../PopoverHelp";
import * as React from "react";
import {getParameterId, IConfigParamProps} from "../config-param-props";
import {MessageSeverity} from "../../store/state";

interface IProps extends IConfigParamProps {
  title?: string
  className?: string;
  children: JSX.Element;
}

/**
 * This component render {@link FormGroup} with validation popover.
 */
const ValidationFormGroup = ({parameter, className, title, message, children}: IProps) => {
  const noMessage = !message;
  const messageText = message && message.text || "";
  const severity = message ? message.severity : MessageSeverity.Warning;
  return (
    <FormGroup
      label={<PopoverHelp enabled={noMessage} title={title || ""} content={messageText} severity={severity}/>}
      className={className}
      labelFor={getParameterId(parameter)}
    >{children}</FormGroup>
  )
};

export default ValidationFormGroup;
