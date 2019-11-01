import classNames from "classnames";
import * as React from "react";
import {Button, IconName} from "@blueprintjs/core";

export enum ListItemAlignment {
  Start = "start",
  End = "end",
}

interface IProps {
  value: any;
  icon: IconName;
  title?: string;
  align?: ListItemAlignment;
  active?: boolean;
  onClick?(): void;
}

/**
 * Component that can be used as child of {@link List} component.
 */
const Tool = (props: IProps) => {
  const className = classNames("tool", {
    "tool--start": props.align !== ListItemAlignment.End,
    "tool--end": props.align === ListItemAlignment.End,
  });

  return (
    <Button className={className}
            minimal={true}
            icon={props.icon}
            title={props.title}
            active={props.active}
            onClick={props.onClick}/>
  );
};

export default Tool;
