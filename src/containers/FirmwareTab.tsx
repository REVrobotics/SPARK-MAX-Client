import {Button} from "@blueprintjs/core";
import * as React from "react";
import {connect} from "react-redux";
import {IApplicationState} from "../store/types";
import SparkManager from "../managers/SparkManager";

interface IProps {
  connected: boolean
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
          <span><Button className="rev-btn" disabled={!this.props.connected} loading={loadingFirmware} onClick={this.openFileDialog}>Load Firmware</Button></span>
        </div>
      </div>
    );
  }

  private openFileDialog() {
    SparkManager.requestFirmware().then((paths: any[]) => {
      this.setState({loadingFirmware: true});
      if (paths.length > 0) {
        this.setState({
          outputText: [...this.state.outputText, "Loading firmware from " + paths[0]]
        });
        SparkManager.loadFirmware(paths[0]).then((res: any) => {
          this.setState({
            outputText: [...this.state.outputText, "Successfully updated firmware."]
          });
          this.setState({loadingFirmware: false});
          SparkManager.getFirmware().then((response: any) => {
            this.setState({firmwareVersion: response.version});
          });
        }).catch(() => {
          this.setState({
            outputText: [...this.state.outputText, "Error loading firmware. Please disconnect the SPARK MAX controller, and try again."]
          });
          this.setState({loadingFirmware: false});
        });
      }
    });
  }
}

export function mapStateToProps(state: IApplicationState) {
  return {
    connected: state.isConnected
  };
}

export default connect(mapStateToProps)(FirmwareTab);