import {Tab, Tabs} from "@blueprintjs/core";
import * as React from 'react';
import {connect} from "react-redux";
import './App.css';
import ConnectionStatusBar from "./components/ConnectionStatusBar";
import AdvancedTab from "./containers/AdvancedTab";
import BasicTab from "./containers/BasicTab";
import HelpTab from "./containers/HelpTab";
import RunTab from "./containers/RunTab";
import {IApplicationState, TabId} from "./store/state";
import WebProvider from "./providers/WebProvider";
import {disconnectCurrentDevice, initApplication, setSelectedTab, SparkDispatch} from "./store/actions";
import UiSupport from "./containers/UiSupport";
import NetworkTab from "./containers/NetworkTab";
import {queryHasRunningDevices, querySelectedTabId} from "./store/selectors";

interface IProps {
  selectedTab: TabId;
  hasRunningDevices: boolean;

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
    const {selectedTab, hasRunningDevices, selectTab} = this.props;

    return (
      <div id="main-container" className="flex-column">
        <UiSupport/>
        <ConnectionStatusBar/>
        <Tabs id="main-tabs"
              className="flex-1 main-tabs"
              selectedTabId={selectedTab}
              onChange={selectTab}
              renderActiveTabPanelOnly={true}>
          <Tab id={TabId.Basic} disabled={hasRunningDevices} title={tt("lbl_basic_tab")} panel={<BasicTab/>}/>
          <Tab id={TabId.Advanced} disabled={hasRunningDevices} title={tt("lbl_advanced_tab")} panel={<AdvancedTab/>}/>
          <Tab id={TabId.Run} title={tt("lbl_run_tab")} panel={<RunTab/>}/>
          <Tab id={TabId.Network} disabled={hasRunningDevices} title={tt("lbl_network_tab")} panel={<NetworkTab/>}/>
          <Tab id={TabId.Help} title={tt("lbl_help_tab")} panel={<HelpTab/>}/>
        </Tabs>
      </div>
    );
  }
}

export function mapStateToProps(state: IApplicationState) {
  return {
    selectedTab: querySelectedTabId(state),
    hasRunningDevices: queryHasRunningDevices(state),
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
