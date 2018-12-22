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
  connected: boolean
  onSensorSelect: (sensorType: Sensor) => void
}

export const SensorTypeSelect: React.SFC<IProps> = (props) => {
  return (
    <SensorSelect filterable={false} items={defaultItems} itemRenderer={renderer} onItemSelect={props.onSensorSelect}>
      <Button fill={true} disabled={!props.connected} text={props.activeSensor.name} rightIcon="double-caret-vertical" />
    </SensorSelect>
  );
};