import {getDfuDeviceId, getNetworkDeviceVirtualId, INetworkState} from "../state";
import {ActionType, ApplicationActions} from "../actions";
import {setArrayElementBy, setField, setFields} from "../../utils/object-utils";

const initialNetworkState: INetworkState = {
  devices: [],
  dfuDevices: [],
  isSelectAllDfuDevices: false,
  outputText: [],
  firmwareLoading: false,
  firmwareLoadingProgress: 0,
  firmwareLoadingText: "",
  scanInProgress: false,
  lastFirmwareLoadingMessage: "",
};

const networkReducer = (state: INetworkState = initialNetworkState, action: ApplicationActions): INetworkState => {
  switch (action.type) {
    case ActionType.SET_NETWORK_DEVICES:
      return setFields(state, {
        devices: action.payload.devices,
        dfuDevices: action.payload.dfuDevices,
      });
    case ActionType.SELECT_DFU_DEVICE:
      return setField(
        state,
        "dfuDevices",
        setArrayElementBy(
          state.dfuDevices,
          getDfuDeviceId,
          action.payload.id,
          (dfuDevice) => setField(dfuDevice, "selected", action.payload.selected)));
    case ActionType.SELECT_ALL_DFU_DEVICES:
      return setField(state, "isSelectAllDfuDevices", action.payload.selected);
    case ActionType.UPDATE_NETWORK_DEVICE:
      return setField(
        state,
        "devices",
        setArrayElementBy(
          state.devices,
          getNetworkDeviceVirtualId,
          action.payload.id,
          (device) => setFields(device, action.payload.update)));
    case ActionType.SET_FIRMWARE_LOADING:
      return setField(state, "firmwareLoading", action.payload.loading);
    case ActionType.SET_NETWORK_SCAN_IN_PROGRESS:
      return setField(state, "scanInProgress", action.payload.scanInProgress);
    case ActionType.CONSOLE_OUTPUT:
      return setField(state, "outputText", state.outputText.concat([action.payload.text]));
    case ActionType.SET_CONSOLE_OUTPUT:
      return setField(state, "outputText", action.payload.text);
    case ActionType.SET_LAST_FIRMWARE_LOADING_MESSAGE:
      return setField(state, "lastFirmwareLoadingMessage", action.payload.message);
    case ActionType.UPDATE_FIRMWARE_LOADING_PROGRESS:
      return setFields(state, {
        firmwareLoadingProgress: action.payload.progress,
        firmwareLoadingText: action.payload.text,
      });
  }
  return state;
};

export default networkReducer;
