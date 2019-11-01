import classNames from "classnames";
import * as React from "react";
import {ReactNode} from "react";
import {Button} from "@blueprintjs/core";

interface IProps {
  value: any;
  className?: string;
  title?: string;
  active?: boolean;
  children?: ReactNode;
  options?: ReactNode;

  onClick?(): void;
}

/**
 * Component that can be used as child of {@link List} component.
 */
const ListItem = (props: IProps) => {
  const className = classNames("list-item", props.className, {
    "list-item--active": props.active,
  });

  return (
    <div className={className}>
      <Button className="list-item__button"
              minimal={true}
              fill={true}
              active={props.active}
              title={props.title}
              onClick={props.onClick}>{props.children}</Button>
      {props.options ? <div className="list-item__options">{props.options}</div> : null}
    </div>
  );
};

export default ListItem;
