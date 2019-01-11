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
// import SettingsTab from "./containers/SettingsTab";
import SparkManager from "./managers/SparkManager";
import MotorConfiguration from "./models/MotorConfiguration";
import {
  addLog,
  setConnectedDevice,
  setIsConnecting,
  setMotorConfig,
  setUpdateAvailable,
  updateConnectionStatus
} from "./store/actions";
import {
  ApplicationActions, IAddLog, ISetConnectedDevice, ISetIsConnecting, ISetMotorConfig, ISetUpdateAvailable,
  IUpdateConnectionStatus
} from "./store/types";
import WebProvider from "./providers/WebProvider";
import AboutTab from "./containers/AboutTab";

/* TEST_JSON only used for when WebProvider isn't available. */
// const TEST_JSON = {
//   "firmware": [
//     {
//       "spec": "Beta",
//       "version": "0.1.99999"
//     },
//     {
//       "spec": "Recovery Update Required",
//       "version": "1.0.372"
//     },
//     {
//       "spec": "Previous",
//       "version": "1.0.373",
//       "url": "https://www.revrobotics.com/content/uw/sparkmax/firmware/sparkmax-firmwar-1.0.373.dfu",
//       "md5": "23f232a3b2df2867c2097239870980987c0fa0"
//     },
//     {
//       "spec": "Latest",
//       "version": "1.0.376",
//       "url": "https://www.revrobotics.com/content/uw/sparkmax/firmware/sparkmax-firmwar-1.0.376.dfu",
//       "md5": "23f232a3b2df2867c2097239870980987c0fa0"
//     }
//   ],
//   "GUI": [
//     {
//       "spec": "Previous",
//       "version": "0.8.1",
//       "url": "https://www.revrobotics.com/content/uw/sparkmax/gui/sparkmax-gui-0.8.1.exe",
//       "md5": "23f232a3b2df2867c2097239870980987c0fa0"
//     },
//     {
//       "spec": "Latest",
//       "version": "0.9.7",
//       "url": "https://www.revrobotics.com/content/uw/sparkmax/gui/sparkmax-gui-0.9.7.exe",
//       "md5": "23f232a3b2df2867c2097239870980987c0fa0"
//     }
//   ]
// };

interface IProps {
  updateConnectionStatus: (connected: boolean, status: string) => IUpdateConnectionStatus,
  setIsConnecting: (connecting: boolean) => ISetIsConnecting,
  setConnectedDevice: (device: string) => ISetConnectedDevice,
  setCurrentConfig: (cofig: MotorConfiguration) => ISetMotorConfig,
  addLog: (log: string) => IAddLog,
  setUpdateAvailable: (updateAvailable: boolean) => ISetUpdateAvailable
}

class App extends React.Component<IProps> {
  constructor(props: IProps) {
    super(props);

    WebProvider.initialize("www.revrobotics.com");
  }

  public componentDidMount() {
    this.downloadLatestFirmware();
    this.props.updateConnectionStatus(false, "SEARCHING...");
    this.props.setIsConnecting(true);
    SparkManager.discoverAndConnect().then((device: string) => {
      this.props.updateConnectionStatus(true, "CONNECTED");
      this.props.setIsConnecting(false);
      this.props.setConnectedDevice(device);
      SparkManager.getConfigFromParams().then((config: MotorConfiguration) => {
        this.props.setCurrentConfig(config);
        this.checkForFirmwareUpdate();
      });
    }).catch((error: any) => {
      this.props.updateConnectionStatus(false, "CONNECTION FAILED");
      this.props.setIsConnecting(false);
      this.props.addLog(error);
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
          {/*<Tab id="main-tab-network" title="Network" panel={<span>Network</span>} />*/}
          <Tab id="main-tab-firmware" title="Firmware" panel={<FirmwareTab/>} />
          <Tab id="main-tab-help" title="Help" panel={<HelpTab/>} />
          <Tab id="main-tab-about" title="About" panel={<AboutTab/>} />
          {/*<Tab id="main-tab-settings" title="Settings" panel={<SettingsTab/>} />*/}
        </Tabs>
      </div>
    );
  }

  private checkForFirmwareUpdate() {
    SparkManager.getFirmware().then((versionJSON: any) => {
      if (versionJSON.version && versionJSON.version.length > 0) {
        const version = versionJSON.version.substring(1, versionJSON.version.length);
        WebProvider.get("content/sw/max/sparkmax-gui-cfg.json").then((firmwareJSON: any) => {
        // const firmwareJSON: any = TEST_JSON;
          if (firmwareJSON.firmware) {
            for (const firmware of firmwareJSON.firmware) {
              if (firmware.spec === "Latest") {
                if (this.isOldFirmware(version, firmware.version)) {
                  SparkManager.showInfoBox("SPARK MAX Firmware", `Your motor controller is using an older version of firmware. The client will download the latest version, and can be loaded in the 'Firmware' tab.`);
                }
              }
            }
          }
        }).catch((error: any) => {
          this.props.addLog(error);
        });
      }
    });
  }

  private downloadLatestFirmware() {
    WebProvider.get("content/sw/max/sparkmax-gui-cfg.json").then((firmwareJSON: any) => {
      if (firmwareJSON.firmware) {
        for (const firmware of firmwareJSON.firmware) {
          if (firmware.spec === "Latest") {
            SparkManager.downloadFile(firmware.url);
          }
        }
      }
    }).catch((error: any) => {
      this.props.addLog(error);
    });
  }

  private isOldFirmware(current: string, other: string): boolean {
    const currentParts: string[] = current.split(".");
    const otherParts: string[] = other.split(".");
    const curMajor = parseInt(currentParts[0], 10);
    const curMinor = parseInt(currentParts[1], 10);
    const curBuild = parseInt(currentParts[2], 10);
    const othMajor = parseInt(otherParts[0], 10);
    const othMinor = parseInt(otherParts[1], 10);
    const othBuild = parseInt(otherParts[2], 10);
    if (curMajor < othMajor) {
      return true;
    } else if (curMinor < othMinor) {
      return true;
    } else {
      return curBuild < othBuild;
    }
  }
}

export function mapDispatchToProps(dispatch: Dispatch<ApplicationActions>) {
  return {
    setConnectedDevice: (device: string) => dispatch(setConnectedDevice(device)),
    setCurrentConfig: (config: MotorConfiguration) => dispatch(setMotorConfig(config)),
    setIsConnecting: (connecting: boolean) => dispatch(setIsConnecting(connecting)),
    updateConnectionStatus: (connected: boolean, status: string) => dispatch(updateConnectionStatus(connected, status)),
    addLog: (log: string) => dispatch(addLog(log)),
    setUpdateAvailable: (updateAvailable: boolean) => dispatch(setUpdateAvailable(updateAvailable))
  };
}

export default connect(null, mapDispatchToProps)(App);
