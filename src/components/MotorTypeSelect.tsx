import {Button, MenuItem} from "@blueprintjs/core";
import {IItemRendererProps, Select} from "@blueprintjs/select";
import * as React from "react";
import MotorConfiguration, {REV_BRUSHLESS, REV_BRUSHED} from "../models/MotorConfiguration";

const MotorSelect = Select.ofType<MotorConfiguration>();

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
  activeConfig: MotorConfiguration
  connected: boolean
  onMotorSelect(motorType: MotorConfiguration): void
}

export const MotorTypeSelect: React.FC<IProps> = (props) => {
  const disabled = !props.connected;

  return (
    <MotorSelect filterable={false}
                 disabled={disabled}
                 items={defaultItems}
                 itemRenderer={renderer}
                 onItemSelect={props.onMotorSelect}>
      <Button fill={true} disabled={disabled} text={props.activeConfig.name} rightIcon="double-caret-vertical" />
    </MotorSelect>
  );
};