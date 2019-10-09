import {IFirmwareState} from "../state";
import {ActionType, ApplicationActions} from "../actions";
import {setField, setFields} from "../../utils/object-utils";

const initialFirmwareState: IFirmwareState = {
  loading: false,
  loadError: false,
  config: undefined,
};

const firmwareReducer = (state: IFirmwareState = initialFirmwareState,
                         action: ApplicationActions): IFirmwareState => {
  switch (action.type) {
    case ActionType.SET_FIRMWARE_DOWNLOADING:
      return setField(state, "loading", true);
    case ActionType.SET_FIRMWARE_DOWNLOADED:
      return setFields(state, {
        config: action.payload.config,
        loading: false,
        loadError: false,
      });
    case ActionType.SET_FIRMWARE_DOWNLOAD_ERROR:
      return setFields(state, { loadError: true, loading: false});
    default:
      return state;
  }
};

export default firmwareReducer;
