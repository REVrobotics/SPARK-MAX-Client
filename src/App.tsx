import {Tab, Tabs} from "@blueprintjs/core";
import * as React from 'react';
import './App.css';
import ConnectionStatusBar from "./components/ConnectionStatusBar";
import AdvancedTab from "./containers/AdvancedTab";
import BasicTab from "./containers/BasicTab";
import FirmwareTab from "./containers/FirmwareTab";
import HelpTab from "./containers/HelpTab";
import PIDTunerTab from "./containers/PIDTunerTab";
import RunTab from "./containers/RunTab";

class App extends React.Component {
  public render() {
    return (
      <div id="main-container">
        <ConnectionStatusBar/>
        <Tabs id="main-tabs" defaultSelectedTabId="main-tab-basic" renderActiveTabPanelOnly={true}>
          <Tab id="main-tab-basic" title="Basic" panel={<BasicTab/>} />
          <Tab id="main-tab-advanced" title="Advanced" panel={<AdvancedTab/>} />
          <Tab id="main-tab-run" title="Run" panel={<RunTab/>} />
          <Tab id="main-tab-pid" title="PID Tuner" panel={<PIDTunerTab/>} />
          <Tab id="main-tab-network" title="Network" panel={<span>Network</span>} />
          <Tab id="main-tab-firmware" title="Firmware" panel={<FirmwareTab/>} />
          <Tab id="main-tab-help" title="Help" panel={<HelpTab logs={[]}/>} />
        </Tabs>
      </div>
    );
  }
}

export default App;
