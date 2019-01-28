import * as React from "react";
import {Icon, Popover} from "@blueprintjs/core";

interface IProps {
  content: string | JSX.Element,
  title: string,
  enabled?: boolean
}

class PopoverHelp extends React.Component<IProps> {
  constructor(props: IProps) {
    super(props);
  }

  public render() {
    const {content, enabled, title} = this.props;
    const disabled = typeof enabled !== "undefined" ? enabled : false;
    return (
      <div className="popover-container">
        {title}
        {
          !disabled &&
          <Popover
            disabled={typeof enabled !== "undefined" ? enabled : false}
            content={content}
            target={<Icon icon={"help"}/>}
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