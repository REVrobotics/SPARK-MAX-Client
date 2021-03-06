import * as React from "react";
import {ComponentType} from "react";
import {IConfigParamProps} from "../components/config-param-props";
import * as classNames from "classnames";

export type WithProps<P> = P & {
  className?: string;
};

/**
 * This HOC adds class to the wrapped component to highlight it as dirty.
 * @param Component
 */
export function withDirty<P extends WithProps<IConfigParamProps>>(Component: ComponentType<P>): ComponentType<P> {
  return (props: WithProps<P>) => {
    const className = classNames(props.className, {"modified": props.isDirty});
    return <Component {...props} className={className}/>
  };
}
