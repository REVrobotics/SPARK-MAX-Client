import {Button, MenuItem} from "@blueprintjs/core";
import {IItemRendererProps, Select} from "@blueprintjs/select";
import * as React from "react";
import {getCanIdFromDeviceId, getVirtualDeviceId, IDeviceState} from "../store/state";
import {useMemo} from "react";

const BpDeviceSelect = Select.ofType<IDeviceState>();

const getDeviceText = (device: IDeviceState) =>
  `ID ${getCanIdFromDeviceId(device.fullDeviceId)} ${device.info.deviceName}`;

const renderer = (device: IDeviceState, itemProps: IItemRendererProps) => {
  return (
    <MenuItem
      key={getVirtualDeviceId(device)}
      onClick={itemProps.handleClick}
      text={getDeviceText(device)}
    />
  );
};

interface IProps {
  className: string;
  devices: IDeviceState[]
  selected?: IDeviceState;

  onOpened(): void;
  onClosed(): void;
  onSelect(device: IDeviceState): void;
}

export const DeviceSelect: React.FC<IProps> = ({className, devices, selected, onOpened, onClosed, onSelect}) => {
  const disabled = devices.length <= 1;

  const popoverProps = useMemo(() => ({ onOpened, onClosed }), []);

  return (
    <BpDeviceSelect className={className}
                    items={devices}
                    disabled={disabled}
                    filterable={false}
                    popoverProps={popoverProps}
                    itemRenderer={renderer} onItemSelect={onSelect}>
      <Button fill={true}
              disabled={disabled}
              text={selected ? getDeviceText(selected) : "NO DEVICES"}
              rightIcon="double-caret-vertical"/>
    </BpDeviceSelect>
  );
};
