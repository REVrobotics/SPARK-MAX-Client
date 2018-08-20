import {Button} from "@blueprintjs/core";
import * as React from "react";
import {connect} from "react-redux";
import {IApplicationState} from "../store/types";

interface IProps {
  connected: boolean
}

interface IState {
  firmwareVersion: string,
  outputText: string[]
}

class FirmwareTab extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      firmwareVersion: "0.0.1",
      outputText: ["Please connect to a device to see it's firmware.", "Connected. Loading firmware..."]
    };
  }


  public render() {
    const {outputText, firmwareVersion} = this.state;
    return (
      <div>
        <div id="firmware-console">
          {outputText.map(line => {
            return <p key={line}>{line}</p>;
          })}
        </div>
        <div id="firmware-bar">
          <span>Current Firmware: {firmwareVersion}</span>
          <span><Button className="rev-btn" disabled={!this.props.connected}>Load Firmware</Button></span>
        </div>
      </div>
    );
  }
}

export function mapStateToProps(state: IApplicationState) {
  return {
    connected: state.isConnected
  };
}

export default connect(mapStateToProps)(FirmwareTab);