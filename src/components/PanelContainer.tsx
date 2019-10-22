import classNames from "classnames";
import * as React from "react";
import {Icon, IconName} from "@blueprintjs/core";
import {ReactNode} from "react";

interface IProps {
  className?: string;
  icon: IconName;
  title: string;
  children: ReactNode;
}

const PanelContainer = (props: IProps) => {
  return (
    <div className={classNames("panel-container flex-row", props.className)}>
      <div className="panel-container__header">
        <Icon className="panel-container__icon" icon={props.icon} iconSize={32}/>
        <div className="panel-container__title">{props.title}</div>
      </div>
      <div className="flex-1 flex-row panel-container__body">{props.children}</div>
    </div>
  );
};

export default PanelContainer;
