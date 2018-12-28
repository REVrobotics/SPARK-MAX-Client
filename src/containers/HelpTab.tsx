import {Alert, Button, Dialog} from "@blueprintjs/core";
import * as React from "react";
import {IApplicationState} from "../store/types";
import {connect} from "react-redux";
import SparkManager from "../managers/SparkManager";

interface IProps {
  logs: string[],
  updateAvailable: boolean
}

interface IState {
  updateAlertOpen: boolean,
  viewingLogs: boolean
}

class HelpTab extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      updateAlertOpen: false,
      viewingLogs: false
    };
    this.viewLogs = this.viewLogs.bind(this);
    this.unviewLogs = this.unviewLogs.bind(this);
    this.closeUpdateAlert = this.closeUpdateAlert.bind(this);
    this.quitAndUpdate = this.quitAndUpdate.bind(this);
    this.checkForUpdates = this.checkForUpdates.bind(this);
  }

  public render() {
    const {updateAlertOpen, viewingLogs} = this.state;
    const {updateAvailable} = this.props;
    return (
      <div>
        <Alert
          isOpen={updateAlertOpen}
          cancelButtonText={"Cancel"}
          confirmButtonText={updateAvailable ? "Yes, Update" : "Okay"}
          intent="success"
          onCancel={this.closeUpdateAlert}
          onClose={this.closeUpdateAlert}
          onConfirm={updateAvailable ? this.quitAndUpdate : this.closeUpdateAlert}
        >
          {
            updateAvailable ? "There is an update available for the SPARK MAX Client application. Would you like to update?" : "There are currently no updates available for the SPARK MAX Client."
          }
        </Alert>
        <Dialog
          isOpen={viewingLogs}
          onClose={this.unviewLogs}
        >
          <div className="bp3-dialog-header">
            <h4 className="bp3-heading">Application Logs</h4>
          </div>
          <div className="bp3-dialog-body">
            {this.props.logs.length === 0 && <span><i>There are currently no application logs.</i></span>}
            {this.props.logs.map((log, index) => {
              return <p key={index}>{log}</p>
            })}
          </div>
        </Dialog>
        <div id="help-troubleshoot">
          <h2>Troubleshooting</h2>
          <ol>
            <li>Try restarting the program.</li>
            <li>After restarting the program, unplug the usb from the computer and plug it in again.</li>
            <li>Make sure you're using the latest version of the SPARK MAX Client.</li>
            <li>Contact <a href="mailto:support@revrobotics.com">support@revrobotics.com</a></li>
          </ol>
        </div>
        <div className="form">
          <Button className="rev-btn" onClick={this.viewLogs}>View Application Logs</Button>
        </div>
        <div className="form update-container">
          <Button className="rev-btn" onClick={this.checkForUpdates}>Check for Updates</Button>
        </div>
      </div>
    );
  }

  private viewLogs() {
    this.setState({viewingLogs: true});
  }

  private unviewLogs() {
    this.setState({viewingLogs: false});
  }

  private closeUpdateAlert() {
    this.setState({updateAlertOpen: false});
  }

  private checkForUpdates() {
    this.setState({updateAlertOpen: true});
  }

  private quitAndUpdate() {
    this.setState({updateAlertOpen: false});
    setTimeout(() => {
      SparkManager.installUpdate();
    }, 500);
  }

}

export function mapStateToProps(state: IApplicationState) {
  return {
    logs: state.logs,
    updateAvailable: state.updateAvailable
  };
}

export default connect(mapStateToProps)(HelpTab);