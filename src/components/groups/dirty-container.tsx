import * as React from "react";
import {ComponentType} from "react";
import {IParamSourceProps} from "../param-source";
import * as classNames from "classnames";

export type WithProps<P> = P&{
  className?: string;
};

export function dirtyContainer<P extends WithProps<IParamSourceProps>>(Component: ComponentType<P>): ComponentType<P> {
  return (props: WithProps<P>) => {
    const className = classNames(props.className, {"modified": props.isDirty});
    return <Component {...props} className={className}/>
  };
}
