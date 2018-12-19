import {Tab, Tabs} from "@blueprintjs/core";
import * as React from 'react';
import {connect} from "react-redux";
import {Dispatch} from "redux";
import './App.css';
import ConnectionStatusBar from "./components/ConnectionStatusBar";
import AdvancedTab from "./containers/AdvancedTab";
import BasicTab from "./containers/BasicTab";
import FirmwareTab from "./containers/FirmwareTab";
import HelpTab from "./containers/HelpTab";
import RunTab from "./containers/RunTab";
import SettingsTab from "./containers/SettingsTab";
import SparkManager from "./managers/SparkManager";
import MotorConfiguration from "./models/MotorConfiguration";
import {setConnectedDevice, setIsConnecting, setMotorConfig, updateConnectionStatus} from "./store/actions";
import {
  ApplicationActions, ISetConnectedDevice, ISetIsConnecting, ISetMotorConfig,
  IUpdateConnectionStatus
} from "./store/types";

interface IProps {
  updateConnectionStatus: (connected: boolean, status: string) => IUpdateConnectionStatus,
  setIsConnecting: (connecting: boolean) => ISetIsConnecting,
  setConnectedDevice: (device: string) => ISetConnectedDevice,
  setCurrentConfig: (cofig: MotorConfiguration) => ISetMotorConfig
}

class App extends React.Component<IProps> {
  constructor(props: IProps) {
    super(props);
  }

  public componentDidMount() {
    this.props.updateConnectionStatus(false, "SEARCHING...");
    this.props.setIsConnecting(true);
    SparkManager.discoverAndConnect().then((device: string) => {
      this.props.updateConnectionStatus(true, "CONNECTED");
      this.props.setIsConnecting(false);
      this.props.setConnectedDevice(device);
      SparkManager.getConfigFromParams().then((config: MotorConfiguration) => {
        this.props.setCurrentConfig(config);
        console.log(config);
      });
    }).catch((error: any) => {
      this.props.updateConnectionStatus(false, "CONNECTION FAILED");
      this.props.setIsConnecting(false);
    });
    SparkManager.onDisconnect(() => {
      this.props.updateConnectionStatus(false, "DISCONNECTED");
      this.props.setConnectedDevice("");
    });
  }

  public render() {
    return (
      <div id="main-container">
        <ConnectionStatusBar/>
        <Tabs id="main-tabs" defaultSelectedTabId="main-tab-basic" renderActiveTabPanelOnly={true}>
          <Tab id="main-tab-basic" title="Basic" panel={<BasicTab/>} />
          <Tab id="main-tab-advanced" title="Advanced" panel={<AdvancedTab/>} />
          <Tab id="main-tab-run" title="Run" panel={<RunTab/>} />
          <Tab id="main-tab-network" title="Network" panel={<span>Network</span>} />
          <Tab id="main-tab-firmware" title="Firmware" panel={<FirmwareTab/>} />
          <Tab id="main-tab-help" title="Help" panel={<HelpTab logs={[]}/>} />
          <Tab id="main-tab-settings" title="Settings" panel={<SettingsTab/>} />
        </Tabs>
      </div>
    );
  }
}

export function mapDispatchToProps(dispatch: Dispatch<ApplicationActions>) {
  return {
    setConnectedDevice: (device: string) => dispatch(setConnectedDevice(device)),
    setCurrentConfig: (config: MotorConfiguration) => dispatch(setMotorConfig(config)),
    setIsConnecting: (connecting: boolean) => dispatch(setIsConnecting(connecting)),
    updateConnectionStatus: (connected: boolean, status: string) => dispatch(updateConnectionStatus(connected, status))
  };
}

export default connect(null, mapDispatchToProps)(App);
