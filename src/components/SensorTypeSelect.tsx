import {Button, MenuItem} from "@blueprintjs/core";
import {IItemRendererProps, Select} from "@blueprintjs/select";
import * as React from "react";
import Sensor, {NO_SENSOR, HALL_SENSOR, ENCODER} from "../models/Sensor";

const SensorSelect = Select.ofType<Sensor>();

const defaultItems: Sensor[] = [NO_SENSOR, HALL_SENSOR, ENCODER];

const renderer = (sensor: Sensor, itemProps: IItemRendererProps) => {
  return (
    <MenuItem
      active={itemProps.modifiers.active}
      key={sensor.name}
      onClick={itemProps.handleClick}
      text={sensor.name}
    />
  );
};

interface IProps {
  activeSensor: Sensor
  connected: boolean,
  disabled?: boolean,
  onSensorSelect(sensorType: Sensor): void
}

export const SensorTypeSelect: React.FC<IProps> = (props) => {
  const disabled = !props.connected || props.disabled;

  return (
    <SensorSelect filterable={false}
                  disabled={disabled}
                  items={defaultItems}
                  itemRenderer={renderer}
                  onItemSelect={props.onSensorSelect}>
      <Button fill={true} disabled={disabled} text={props.activeSensor.name} rightIcon="double-caret-vertical" />
    </SensorSelect>
  );
};