import {Button, MenuItem} from "@blueprintjs/core";
import {IItemRendererProps, Select} from "@blueprintjs/select";
import * as React from "react";
import {IDeviceState} from "../store/types";

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
  return (
    <BpDeviceSelect className={className}
                    items={devices}
                    filterable={false}
                    itemRenderer={renderer} onItemSelect={onSelect}>
      <Button fill={true}
              disabled={devices.length <= 1}
              text={selected ? getDeviceText(selected) : ""}
              rightIcon="double-caret-vertical"/>
    </BpDeviceSelect>
  );
};