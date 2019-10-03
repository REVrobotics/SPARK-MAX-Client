import {Button, MenuItem} from "@blueprintjs/core";
import {IItemRendererProps, Select} from "@blueprintjs/select";
import * as React from "react";
import {noop} from "../utils/function-utils";

// Currently code in this file is more a stub than a final solution

const MotorConfigurationSelect = Select.ofType<any>();

const defaultItems: any[] = [];

const renderer = (configuration: any, itemProps: IItemRendererProps) => {
  return (
    <MenuItem
      active={itemProps.modifiers.active}
      key={configuration.name}
      onClick={itemProps.handleClick}
      text={configuration.name}
    />
  );
};

interface IProps {
  disabled: boolean
}

export const ConfigurationSelect: React.FC<IProps> = (props) => {
  return (
    <MotorConfigurationSelect filterable={false}
                              disabled={true}
                              items={defaultItems}
                              itemRenderer={renderer} onItemSelect={noop}>
      <Button fill={true} disabled={true} text="Brushless" rightIcon="double-caret-vertical"/>
    </MotorConfigurationSelect>
  );
};