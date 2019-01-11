import {Alert, Button, Dialog, ProgressBar} from "@blueprintjs/core";
import * as React from "react";
import {IApplicationState} from "../store/types";
import {connect} from "react-redux";
import SparkManager from "../managers/SparkManager";

interface IProps {
  logs: string[]
}

interface IState {
  checkingForUpdate: boolean,
  downloadJSON: any,
  downloadingUpdate: boolean,
  quitAndInstallAlertOpen: boolean,
  updateAlertOpen: boolean,
  updateAvailable: boolean,
  viewingLogs: boolean
}

class HelpTab extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      checkingForUpdate: false,
      downloadJSON: {},
      downloadingUpdate: false,
      quitAndInstallAlertOpen: false,
      updateAlertOpen: false,
      updateAvailable: false,
      viewingLogs: false
    };
    this.viewLogs = this.viewLogs.bind(this);
    this.unviewLogs = this.unviewLogs.bind(this);
    this.closeUpdateAlert = this.closeUpdateAlert.bind(this);
    this.closeQuitAndInstallAlert = this.closeQuitAndInstallAlert.bind(this);
    this.downloadUpdate = this.downloadUpdate.bind(this);
    this.showQuitAndInstallAlert = this.showQuitAndInstallAlert.bind(this);
    this.onProgressUpdate = this.onProgressUpdate.bind(this);
    this.quitAndUpdate = this.quitAndUpdate.bind(this);
    this.checkForUpdates = this.checkForUpdates.bind(this);
  }

  public render() {
    const {checkingForUpdate, downloadJSON, downloadingUpdate, quitAndInstallAlertOpen, updateAlertOpen, updateAvailable, viewingLogs} = this.state;
    return (
      <div>
        <Alert
          isOpen={updateAlertOpen}
          cancelButtonText={"Cancel"}
          confirmButtonText={updateAvailable ? "Yes, Update" : "Okay"}
          intent="success"
          onCancel={this.closeUpdateAlert}
          onClose={this.closeUpdateAlert}
          onConfirm={updateAvailable ? this.downloadUpdate : this.closeUpdateAlert}
        >
          {
            updateAvailable ? "There is an update available for the SPARK MAX Client application. Would you like to update?" : "There are currently no updates available for the SPARK MAX Client."
          }
        </Alert>
        <Alert
          isOpen={quitAndInstallAlertOpen}
          cancelButtonText={"Cancel"}
          confirmButtonText={"Yes, Quit And Install"}
          intent="success"
          onCancel={this.closeQuitAndInstallAlert}
          onClose={this.closeQuitAndInstallAlert}
          onConfirm={this.quitAndUpdate}
        >
          Successfully downloaded update. Would you like to quit and install it now?
        </Alert>
        <Dialog
          isOpen={viewingLogs}
          onClose={this.unviewLogs}
        >c
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
          <Button className="rev-btn" disabled={checkingForUpdate} loading={checkingForUpdate} onClick={this.checkForUpdates}>Check for Updates</Button>
        </div>
        {
          downloadingUpdate &&
          <div id={"help-download"}>
            <div className={"fill-w center-items"}>Downloading Update ({`${(downloadJSON.bytesPerSecond / 1000000).toFixed(2) || "0"}mb/s - ${(downloadJSON.transferred / 1000000).toFixed(2) || "0"}mb total`})</div>
            <div id={"help-download-bar"}>
              <ProgressBar value={downloadJSON.percent / 100} intent={"warning"}/>
            </div>
          </div>
        }
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

  private closeQuitAndInstallAlert() {
    this.setState({quitAndInstallAlertOpen: false});
  }

  private showQuitAndInstallAlert() {
    this.setState({downloadingUpdate: false, quitAndInstallAlertOpen: true});
  }

  private checkForUpdates() {
    this.setState({checkingForUpdate: true});
    SparkManager.checkForUpdates().then((available: boolean) => {
      this.setState({checkingForUpdate: false, updateAlertOpen: true, updateAvailable: available});
    });
  }

  private downloadUpdate() {
    this.setState({downloadingUpdate: true});
    SparkManager.beginDownload();
    SparkManager.onUpdateDownloaded(this.showQuitAndInstallAlert);
    SparkManager.onDownloadProgress(this.onProgressUpdate);
  }

  private onProgressUpdate(event: any, downloadJSON: any) {
    this.setState({downloadJSON});
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
    logs: state.logs
  };
}

export default connect(mapStateToProps)(HelpTab);