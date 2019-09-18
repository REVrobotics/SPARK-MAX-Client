import {first} from "lodash";
import {IApplicationState} from "./types";

export const firstUsbDeviceSelector = (state: IApplicationState) => first(state.usbDevices);

export const isConnectableSelector = (state: IApplicationState) => state.usbDevices.length > 0;
