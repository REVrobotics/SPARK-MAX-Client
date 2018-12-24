import {Button} from "@blueprintjs/core";
import * as React from "react";
import {connect} from "react-redux";
import {ApplicationActions, IApplicationState, ISetIsConnecting, IUpdateConnectionStatus} from "../store/types";
import SparkManager from "../managers/SparkManager";
import {Dispatch} from "redux";
import {setIsConnecting, updateConnectionStatus} from "../store/actions";

interface IProps {
  connected: boolean,
  setIsConnecting: (connecting: boolean) => ISetIsConnecting,
  updateConnectionStatus: (connected: boolean, status: string) => IUpdateConnectionStatus
}

interface IState {
  firmwareVersion: string,
  outputText: string[],
  loadingFirmware: boolean
}

class FirmwareTab extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      firmwareVersion: "NOT CONNECTED",
      outputText: ["Please connect to a device to see it's firmware."],
      loadingFirmware: false
    };

    this.openFileDialog = this.openFileDialog.bind(this);
    this.updateFirmwareStatus = this.updateFirmwareStatus.bind(this);
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

  public render() {
    const {outputText, firmwareVersion, loadingFirmware} = this.state;
    return (
      <div>
        <div id="firmware-console">
          {outputText.map(line => {
            return <p key={line}>{line}</p>;
          })}
        </div>
        <div id="firmware-bar">
          <span>Current Firmware: {firmwareVersion}</span>
          <span><Button className="rev-btn" loading={loadingFirmware} onClick={this.openFileDialog}>Load Firmware</Button></span>
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
          outputText: [...this.state.outputText, "Loading firmware from " + paths[0]]
        });
        SparkManager.loadFirmware(paths[0], this.updateFirmwareStatus).then((res: any) => {
          if (res.updateComplete && !res.updateCompletedSuccessfully) {
            this.sendFirmwareError();
          } else {
            this.setState({
              outputText: [...this.state.outputText, "Successfully updated firmware."]
            });
            this.setState({loadingFirmware: false});
            this.props.setIsConnecting(false);
            this.props.updateConnectionStatus(false, "CONNECTED");
            SparkManager.getFirmware().then((response: any) => {
              this.setState({firmwareVersion: response.version});
            });
          }
        }).catch(() => {
          this.sendFirmwareError();
        });
      }
    });
  }

  private updateFirmwareStatus(event: any, error: any, response: any) {
    // TODO - Firmware text...
    if (response.updateStarted) {
      this.setState({
        outputText: [...this.state.outputText, "Started firmware update process..."]
      });
    } else if (response.isUpdating) {
      const updatedOutput: string[] = this.state.outputText;
      updatedOutput.pop();
      updatedOutput.push(`(${response.updateStagePercent}) ${response.updateStageMessage}`);
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