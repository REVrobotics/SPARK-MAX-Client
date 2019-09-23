import {Button, MenuItem} from "@blueprintjs/core";
import {IItemRendererProps, Select} from "@blueprintjs/select";
import * as React from "react";
import MotorConfiguration, {REV_BRUSHED, REV_BRUSHLESS} from "../models/MotorConfiguration";
import {noop} from "../utils/function-utils";

// Currently code in this file is more a stub than a final solution

const MotorConfigurationSelect = Select.ofType<MotorConfiguration>();

const defaultItems: MotorConfiguration[] = [REV_BRUSHLESS, REV_BRUSHED];

const renderer = (motor: MotorConfiguration, itemProps: IItemRendererProps) => {
  return (
    <MenuItem
      active={itemProps.modifiers.active}
      key={motor.name}
      onClick={itemProps.handleClick}
      text={motor.name}
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