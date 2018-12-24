import {Button} from "@blueprintjs/core";
import * as React from "react";
import {connect} from "react-redux";
import {ApplicationActions, IApplicationState, ISetIsConnecting, IUpdateConnectionStatus} from "../store/types";
import SparkManager from "../managers/SparkManager";
import {Dispatch} from "redux";
import {setIsConnecting, updateConnectionStatus} from "../store/actions";
import WebProvider from "../providers/WebProvider";

interface IProps {
  connected: boolean,
  setIsConnecting: (connecting: boolean) => ISetIsConnecting,
  updateConnectionStatus: (connected: boolean, status: string) => IUpdateConnectionStatus
}

interface IState {
  firmwareVersion: string,
  firmwarePath: string,
  outputText: string[],
  loadingFirmware: boolean,
  recoveryRequired: boolean
}

class FirmwareTab extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      firmwareVersion: "NOT CONNECTED",
      firmwarePath: "",
      outputText: ["Please connect to a device to see it's firmware."],
      loadingFirmware: false,
      recoveryRequired: false
    };

    this.openFileDialog = this.openFileDialog.bind(this);
    this.updateFirmwareStatus = this.updateFirmwareStatus.bind(this);
    this.loadFirmware = this.loadFirmware.bind(this);
  }

  public componentDidMount(): void {
    if (this.props.connected) {
      this.setState({
        outputText: [...this.state.outputText, "Connected. Loading firmware version..."]
      });
      SparkManager.getFirmware().then((response: any) => {
        this.setState({
          outputText: [...this.state.outputText, "Current firmware version: " + response.version],
          firmwareVersion: response.version
        });
      });
    }
  }

  public componentDidUpdate(prevProps: Readonly<IProps>): void {
    if (prevProps.connected !== this.props.connected) {
      this.componentDidMount();
    }
  }

  public render() {
    const {outputText, firmwareVersion, loadingFirmware, recoveryRequired} = this.state;
    return (
      <div>
        <div id="firmware-console">
          {outputText.map((line, index) => {
            return <p key={index}>{line}</p>;
          })}
        </div>
        <div id="firmware-bar">
          <span>Current Firmware: {firmwareVersion}</span>
          <span><Button className="rev-btn" loading={loadingFirmware} onClick={recoveryRequired ? this.loadFirmware : this.openFileDialog}>{recoveryRequired ? "Continue" : "Load Firmware"}</Button></span>
        </div>
      </div>
    );
  }

  private openFileDialog() {
    SparkManager.requestFirmware().then((paths: any[]) => {
      this.props.setIsConnecting(true);
      this.props.updateConnectionStatus(false, "LOADING FIRMWARE...");
      this.setState({loadingFirmware: true});
      if (paths.length > 0) {
        this.setState({
          firmwarePath: paths[0],
          outputText: [...this.state.outputText, "Loading firmware from " + paths[0]]
        });
        this.checkIfRecoveryRequired().then((required: true) => {
          if (required) {
            this.props.setIsConnecting(false);
            this.props.updateConnectionStatus(this.props.connected, "LOADING FIRMWARE...");
            this.setState({
              recoveryRequired: true,
              loadingFirmware: false,
              outputText: [
                ...this.state.outputText,
                "Your hardware requires a recovery update for this firmware.",
                "Disconnect your controller from the application and your device, then press and hold the button on the controller, and plug it back in again.",
                "After you've completed this process, please press `Continue`."
              ]
            });
          } else {
            this.loadFirmware();
          }
        });
      }
    });
  }

  private checkIfRecoveryRequired(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      SparkManager.getFirmware().then((versionJSON: any) => {
        if (versionJSON.version && versionJSON.version.length > 0) {
          const version = versionJSON.version.substring(1, versionJSON.version.length);
          WebProvider.initialize("www.revrobotics.com");
          WebProvider.get("content/sw/max/sparkmax-gui-cfg.json").then((firmwareJSON: any) => {
            if (firmwareJSON.firmware) {
              for (const firmware of firmwareJSON.firmware) {
                if (firmware.spec === "Recovery Update Required") {
                  if (this.isOldFirmware(version, firmware.version)) {
                    resolve(true);
                  } else {
                    resolve(false);
                  }
                }
              }
            } else {
              reject();
            }
          }).catch(() => {
            reject();
          });
        } else {
          reject();
        }
      }).catch(() => {
        reject();
      });
    });
  }

  private loadFirmware() {
    this.props.setIsConnecting(true);
    this.props.updateConnectionStatus(false, "LOADING FIRMWARE...");
    this.setState({loadingFirmware: true});
    SparkManager.loadFirmware(this.state.firmwarePath, this.updateFirmwareStatus).then((res: any) => {
      if (res.updateComplete && !res.updateCompletedSuccessfully) {
        this.sendFirmwareError();
      } else {
        this.setState({
          outputText: [...this.state.outputText, "Successfully updated firmware."]
        });
        this.setState({loadingFirmware: false});
        this.props.setIsConnecting(false);
        this.props.updateConnectionStatus(true, "CONNECTED");
        SparkManager.getFirmware().then((response: any) => {
          this.setState({firmwareVersion: response.version});
        });
      }
    }).catch(() => {
      this.sendFirmwareError();
    });
  }

  private updateFirmwareStatus(event: any, error: any, response: any) {
    if (response.updateStarted) {
      this.setState({
        outputText: [...this.state.outputText, "Started firmware update process..."]
      });
    } else if (response.isUpdating) {
      const updatedOutput: string[] = this.state.outputText;
      if (typeof response.updateStagePercent !== "undefined") {
        updatedOutput.pop();
        const percentComplete: number = parseFloat(response.updateStagePercent.toFixed(3));
        updatedOutput.push(`(${(percentComplete * 100).toFixed(1)}%) ${response.updateStageMessage}`);
      } else if (typeof response.updateStageMessage !== "undefined") {
        updatedOutput.push(`${response.updateStageMessage}...`);
      }
      this.setState({outputText: updatedOutput});
    }
  }

  private sendFirmwareError() {
    this.setState({
      outputText: [...this.state.outputText, "Error loading firmware. Please disconnect the SPARK MAX controller, and try again."]
    });
    this.setState({loadingFirmware: false});
    if (!this.props.connected) {
      this.props.setIsConnecting(false);
      this.props.updateConnectionStatus(false, "DISCONNECTED");
    } else {
      this.props.setIsConnecting(false);
      this.props.updateConnectionStatus(true, "CONNECTED");
    }
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

export function mapStateToProps(state: IApplicationState) {
  return {
    connected: state.isConnected
  };
}

export function mapDispatchToProps(dispatch: Dispatch<ApplicationActions>) {
  return {
    setIsConnecting: (connecting: boolean) => dispatch(setIsConnecting(connecting)),
    updateConnectionStatus: (connected: boolean, status: string) => dispatch(updateConnectionStatus(connected, status))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(FirmwareTab);