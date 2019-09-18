import {Tab, Tabs} from "@blueprintjs/core";
import * as React from 'react';
import {connect} from "react-redux";
import './App.css';
import ConnectionStatusBar from "./components/ConnectionStatusBar";
import AdvancedTab from "./containers/AdvancedTab";
import BasicTab from "./containers/BasicTab";
import FirmwareTab from "./containers/FirmwareTab";
import HelpTab from "./containers/HelpTab";
import RunTab from "./containers/RunTab";
// import SettingsTab from "./containers/SettingsTab";
import {IApplicationState, SparkDispatch} from "./store/types";
import WebProvider from "./providers/WebProvider";
import AboutTab from "./containers/AboutTab";
import {initApplication} from "./store/init-actions";
import {disconnectCurrentUsbDevice} from "./store/device-actions";

interface IProps {
  init(): void;
  disconnect(): void;
}

class App extends React.Component<IProps> {
  constructor(props: IProps) {
    super(props);

    WebProvider.initialize("www.revrobotics.com");
  }

  public componentDidMount() {
    this.props.init();
  }

  public componentWillUnmount() {
    this.props.disconnect();
  }

  public render() {
    return (
      <div id="main-container">
        <ConnectionStatusBar/>
        <Tabs id="main-tabs" defaultSelectedTabId="main-tab-basic" renderActiveTabPanelOnly={true}>
          <Tab id="main-tab-basic" title="Basic" panel={<BasicTab/>}/>
          <Tab id="main-tab-advanced" title="Advanced" panel={<AdvancedTab/>}/>
          <Tab id="main-tab-run" title="Run" panel={<RunTab/>}/>
          {/*<Tab id="main-tab-network" title="Network" panel={<span>Network</span>} />*/}
          <Tab id="main-tab-firmware" title="Firmware" panel={<FirmwareTab/>}/>
          <Tab id="main-tab-help" title="Help" panel={<HelpTab/>}/>
          <Tab id="main-tab-about" title="About" panel={<AboutTab/>}/>
          {/*<Tab id="main-tab-settings" title="Settings" panel={<SettingsTab/>} />*/}
        </Tabs>
      </div>
    );
  }
}

export function mapStateToProps(state: IApplicationState) {
  return {};
}

export function mapDispatchToProps(dispatch: SparkDispatch) {
  return {
    init: () => dispatch(initApplication()),
    disconnect: () => dispatch(disconnectCurrentUsbDevice()),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
