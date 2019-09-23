import {Button, MenuItem} from "@blueprintjs/core";
import {IItemRendererProps, Select} from "@blueprintjs/select";
import * as React from "react";
import {IDeviceState} from "../store/state";

const BpDeviceSelect = Select.ofType<IDeviceState>();

const getDeviceText = (device: IDeviceState) => `ID ${device.deviceId} ${device.info.deviceName}`;

const renderer = (device: IDeviceState, itemProps: IItemRendererProps) => {
  return (
    <MenuItem
      key={device.deviceId}
      onClick={itemProps.handleClick}
      text={getDeviceText(device)}
    />
  );
};

interface IProps {
  className: string;
  devices: IDeviceState[]
  selected?: IDeviceState;

  onSelect(device: IDeviceState): void;
}

export const DeviceSelect: React.FC<IProps> = ({className, devices, selected, onSelect}) => {
  const disabled = devices.length <= 1;

  return (
    <BpDeviceSelect className={className}
                    items={devices}
                    disabled={disabled}
                    filterable={false}
                    itemRenderer={renderer} onItemSelect={onSelect}>
      <Button fill={true}
              disabled={disabled}
              text={selected ? getDeviceText(selected) : "NO DEVICES"}
              rightIcon="double-caret-vertical"/>
    </BpDeviceSelect>
  );
};