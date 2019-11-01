import {keyBy} from "lodash";
import * as React from "react";
import {connect} from "react-redux";
import {IApplicationState, PanelName} from "../store/state";
import {setDisplaySelectedPanel, SparkDispatch} from "../store/actions";
import {
  queryDisplaySelectedPanel,
  queryHasSignalForSelectedDevice,
  queryIsSelectedDeviceBlocked, queryIsSelectedDeviceConnected,
  queryIsSelectedDeviceLoaded
} from "../store/selectors";
import List from "../components/List";
import Tool, {ListItemAlignment} from "../components/Tool";
import {IconName, NonIdealState, Spinner} from "@blueprintjs/core";
import PanelContainer from "../components/PanelContainer";
import RunDisplay from "./RunDisplay";
import ParametersRunPanel from "./ParametersRunPanel";
import SettingsRunPanel from "./SettingsRunPanel";
import SignalsRunPanel from "./SignalsRunPanel";
import RunQuickBar from "./RunQuickBar";
import RunControlArea from "./RunControlArea";

interface IProps {
  connected: boolean;
  isLoaded: boolean;
  selectedPanel: PanelName;
  selectedDeviceIsBlocked: boolean;
  hasSignalForSelectedDevice: boolean;

  onSelectPanel(panel: PanelName): void;
}

interface PanelOptions {
  value: PanelName;
  icon: IconName;
  title: string;
  align?: ListItemAlignment;
}

const panelOptions: PanelOptions[] = [
  {value: PanelName.Run, icon: "play", title: tt("lbl_run_panel")},
  {value: PanelName.Parameters, icon: "settings", title: tt("lbl_parameters_panel")},
  {value: PanelName.Signals, icon: "timeline-line-chart", title: tt("lbl_signals_panel")},
  {value: PanelName.Settings, icon: "cog", title: tt("lbl_settings_panel"), align: ListItemAlignment.End},
];

const panelOptionsByKey: {[name: string]: PanelOptions} = keyBy(panelOptions, (options) => options.value);

interface RunPanelProps {
  panel: PanelName;
  selectedDeviceIsBlocked: boolean;
  hasSignalForSelectedDevice: boolean;
}

const RunPanel = (props: RunPanelProps) => {
  const {panel, hasSignalForSelectedDevice, selectedDeviceIsBlocked} = props;

  // Only settings panel can be made visible if there is no any signal for selected device
  if (panel !== PanelName.Settings) {
    if (!hasSignalForSelectedDevice) {
      return <NonIdealState icon="info-sign"
                            title={tt("lbl_no_signals_title")}
                            description={tt("lbl_no_signals_description")}/>;
    } else if (selectedDeviceIsBlocked) {
      return <NonIdealState icon="warning-sign"
                            title={tt("lbl_device_blocked_title")}
                            description={tt("lbl_device_blocked_description")}/>;
    }
  }

  switch (panel) {
    case PanelName.Run:
      return <MainRunPanel/>;
    case PanelName.Parameters:
      return <ParametersRunPanel/>;
    case PanelName.Signals:
      return <SignalsRunPanel/>;
    case PanelName.Settings:
      return <SettingsRunPanel/>;
    default:
      return null;
  }
};

const MainRunPanel = () => {
  return (
    <div className="run-main-panel flex-row full-width no-wrap">
      <RunQuickBar className="run-main-panel__quick"/>
      <RunControlArea className="run-main-panel__control-area flex-1"/>
    </div>
  );
};
class RunTab extends React.Component<IProps> {

  public render() {
    const {connected, isLoaded, selectedPanel, hasSignalForSelectedDevice, selectedDeviceIsBlocked, onSelectPanel} = this.props;

    if (!connected) {
      return <NonIdealState icon="disable"
                            title={tt("lbl_no_device_connected_title")}
                            description={tt("lbl_no_device_connected_description")}/>;
    }

    if (!isLoaded) {
      return <NonIdealState icon={<Spinner/>}
                            title={tt("lbl_device_loading")}/>;
    }

    return (
      <div className="page page--full flex-column">
        <div className="flex-row">
          <List className="display__toolbar"
                selected={selectedPanel}
                onSelect={onSelectPanel}>
            {panelOptions.map((options) => <Tool key={options.value} {...options}/>)}
          </List>
          <RunDisplay className="flex-1 display__container"/>
        </div>
        <PanelContainer className="flex-1 display__panel-container"
                        icon={panelOptionsByKey[selectedPanel].icon}
                        title={panelOptionsByKey[selectedPanel].title}>
          <RunPanel panel={selectedPanel}
                    selectedDeviceIsBlocked={selectedDeviceIsBlocked}
                    hasSignalForSelectedDevice={hasSignalForSelectedDevice}/>
        </PanelContainer>
      </div>
    );
  }
}

export function mapStateToProps(state: IApplicationState) {
  return {
    connected: queryIsSelectedDeviceConnected(state),
    isLoaded: queryIsSelectedDeviceLoaded(state),
    selectedPanel: queryDisplaySelectedPanel(state),
    selectedDeviceIsBlocked: queryIsSelectedDeviceBlocked(state),
    hasSignalForSelectedDevice: queryHasSignalForSelectedDevice(state),
  };
}

export function mapDispatchToProps(dispatch: SparkDispatch) {
  return {
    onSelectPanel: (name: PanelName) => dispatch(setDisplaySelectedPanel(name)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(RunTab);
