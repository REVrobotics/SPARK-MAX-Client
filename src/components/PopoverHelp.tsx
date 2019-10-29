import * as React from "react";
import {Icon, Popover} from "@blueprintjs/core";
import {MessageSeverity} from "../models/Message";

interface IProps {
  content: string | JSX.Element,
  title?: string,
  enabled?: boolean
  severity?: MessageSeverity;
}

class PopoverHelp extends React.Component<IProps> {
  constructor(props: IProps) {
    super(props);
  }

  public render() {
    const {content, severity, enabled, title} = this.props;
    const disabled = typeof enabled !== "undefined" ? enabled : false;
    const icon = severity === MessageSeverity.Error ? "error" : "help";

    return (
      <div className="popover-container">
        {title ? <span className="popover-title">{title}</span> : null}
        {
          !disabled &&
          <Popover
            disabled={typeof enabled !== "undefined" ? enabled : false}
            content={content}
            target={<Icon icon={icon}/>}
            interactionKind={"hover"}
            className={"popover-icon"}
            popoverClassName={"popover-popover"}
          />
        }
      </div>
    );
  }
}

export default PopoverHelp;
