import classNames from "classnames";
import {Button, MenuItem} from "@blueprintjs/core";
import {IItemRendererProps, Select} from "@blueprintjs/select";
import * as React from "react";
import {useMemo} from "react";
import {getCanIdFromDeviceId, getVirtualDeviceId, IDeviceState} from "../store/state";
import {Message} from "../models/Message";

const BpDeviceSelect = Select.ofType<IDeviceState>();

const getDeviceText = (device: IDeviceState) =>
  `${tt("lbl_id")} ${getCanIdFromDeviceId(device.fullDeviceId)} ${device.info.deviceName}`;

const createItemRenderer = ({getPrefix, getMarker}: { getPrefix: (device: IDeviceState) => string, getMarker: (device: IDeviceState) => Message | undefined }) =>
  (device: IDeviceState, itemProps: IItemRendererProps) => {
    const markerMessage = getMarker(device);
    const prefixText = getPrefix(device);
    const prefix = prefixText ? <span className="device-prefix">{prefixText}</span> : null;
    const marker = markerMessage ?
      <span className={classNames("device-marker", `device-marker--${markerMessage.severity}`)}>
        ({markerMessage.text})
      </span>
      : null;

    return (
      <MenuItem
        key={getVirtualDeviceId(device)}
        onClick={itemProps.handleClick}
        text={<>{prefix} {getDeviceText(device)}{marker}</>}
      />
    );
  };

interface IProps {
  className: string;
  disabled: boolean;
  devices: IDeviceState[]
  selected?: IDeviceState;
  getPrefix: (device: IDeviceState) => string;
  getMarker: (device: IDeviceState) => Message | undefined;

  onOpened(): void;

  onClosed(): void;

  onSelect(device: IDeviceState): void;
}

export const DeviceSelect: React.FC<IProps> = ({
                                                 className, devices, disabled, selected, getPrefix, getMarker,
                                                 onOpened, onClosed, onSelect,
                                               }) => {
  const popoverProps = useMemo(() => ({onOpened, onClosed}), []);
  const itemRenderer = useMemo(() => createItemRenderer({getPrefix, getMarker}), [getPrefix, getMarker]);

  return (
    <BpDeviceSelect className={className}
                    items={devices}
                    disabled={disabled}
                    filterable={false}
                    popoverProps={popoverProps}
                    itemRenderer={itemRenderer} onItemSelect={onSelect}>
      <Button fill={true}
              disabled={disabled}
              text={selected ? getDeviceText(selected) : tt("lbl_no_devices_uc")}
              rightIcon="double-caret-vertical"/>
    </BpDeviceSelect>
  );
};
