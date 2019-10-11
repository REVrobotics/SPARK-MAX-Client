import {Tab, Tabs} from "@blueprintjs/core";
import * as React from 'react';
import {connect} from "react-redux";
import './App.css';
import ConnectionStatusBar from "./components/ConnectionStatusBar";
import AdvancedTab from "./containers/AdvancedTab";
import BasicTab from "./containers/BasicTab";
import HelpTab from "./containers/HelpTab";
import RunTab from "./containers/RunTab";
// import SettingsTab from "./containers/SettingsTab";
import {IApplicationState, TabId} from "./store/state";
import WebProvider from "./providers/WebProvider";
import AboutTab from "./containers/AboutTab";
import {disconnectCurrentDevice, initApplication, setSelectedTab, SparkDispatch} from "./store/actions";
import UiSupport from "./containers/UiSupport";
import NetworkTab from "./containers/NetworkTab";
import {querySelectedTabId} from "./store/selectors";

interface IProps {
  selectedTab: TabId;

  selectTab(tab: TabId): void;
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
      <div id="main-container" className="flex-column">
        <UiSupport/>
        <ConnectionStatusBar/>
        <Tabs id="main-tabs"
              className="flex-1 main-tabs"
              selectedTabId={this.props.selectedTab}
              onChange={this.props.selectTab}
              renderActiveTabPanelOnly={true}>
          <Tab id={TabId.Basic} title={tt("lbl_basic_tab")} panel={<BasicTab/>}/>
          <Tab id={TabId.Advanced} title={tt("lbl_advanced_tab")} panel={<AdvancedTab/>}/>
          <Tab id={TabId.Run} title={tt("lbl_run_tab")} panel={<RunTab/>}/>
          {/*<Tab id="main-tab-network" title="Network" panel={<span>Network</span>} />*/}
          <Tab id={TabId.Network} title={tt("lbl_network_tab")} panel={<NetworkTab/>}/>
          <Tab id={TabId.Help} title={tt("lbl_help_tab")} panel={<HelpTab/>}/>
          <Tab id={TabId.About} title={tt("lbl_about_tab")} panel={<AboutTab/>}/>
          {/*<Tab id="main-tab-settings" title="Settings" panel={<SettingsTab/>} />*/}
        </Tabs>
      </div>
    );
  }
}

export function mapStateToProps(state: IApplicationState) {
  return {
    selectedTab: querySelectedTabId(state),
  };
}

export function mapDispatchToProps(dispatch: SparkDispatch) {
  return {
    selectTab: (tab: TabId) => dispatch(setSelectedTab(tab)),
    init: () => dispatch(initApplication()),
    disconnect: () => dispatch(disconnectCurrentDevice()),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
