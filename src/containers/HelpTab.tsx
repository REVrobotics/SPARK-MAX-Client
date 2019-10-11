import {Alert, Button, Dialog, ProgressBar} from "@blueprintjs/core";
import * as React from "react";
import {IApplicationState} from "../store/state";
import {connect} from "react-redux";
import SparkManager from "../managers/SparkManager";
import {troubleshootContent} from "../mls/content";

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
    this.openJavaDocs = this.openJavaDocs.bind(this);
    this.openCppDocs = this.openCppDocs.bind(this);
    this.openSamples = this.openSamples.bind(this);
  }

  public render() {
    const {checkingForUpdate, downloadJSON, downloadingUpdate, quitAndInstallAlertOpen, updateAlertOpen, updateAvailable, viewingLogs} = this.state;
    return (
      <div>
        <Alert
          isOpen={updateAlertOpen}
          cancelButtonText={tt("lbl_cancel")}
          confirmButtonText={updateAvailable ? tt("lbl_yes_update") : tt("lbl_cancel")}
          intent="success"
          onCancel={this.closeUpdateAlert}
          onClose={this.closeUpdateAlert}
          onConfirm={updateAvailable ? this.downloadUpdate : this.closeUpdateAlert}
        >
          {
            updateAvailable ? tt("msg_spark_max_client_update") : tt("msg_spark_max_client_no_update")
          }
        </Alert>
        <Alert
          isOpen={quitAndInstallAlertOpen}
          cancelButtonText={tt("lbl_cancel")}
          confirmButtonText={tt("lbl_yes_quit_install")}
          intent="success"
          onCancel={this.closeQuitAndInstallAlert}
          onClose={this.closeQuitAndInstallAlert}
          onConfirm={this.quitAndUpdate}
        >
          {tt("msg_spark_max_client_confirm_update")}
        </Alert>
        <Dialog
          isOpen={viewingLogs}
          onClose={this.unviewLogs}
        >
          <div className="bp3-dialog-header">
            <h4 className="bp3-heading">{tt("lbl_application_logs")}</h4>
          </div>
          <div className="bp3-dialog-body log-container">
            {this.props.logs.length === 0 && <span><i>{tt("lbl_no_application_logs")}</i></span>}
            {this.props.logs.map((log, index) => {
              return <p key={index}>{log}</p>
            })}
          </div>
        </Dialog>
        <div id="help-troubleshoot">
          <h2>{tt("lbl_troubleshooting")}</h2>
          {troubleshootContent}
        </div>
        <div>
          <h2>{tt("lbl_documentation")}</h2>
          <ul>
            <li><a href={"#"} onClick={this.openJavaDocs}>{tt("lbl_spark_max_java_api")}</a></li>
            <li><a href={"#"} onClick={this.openCppDocs}>{tt("lbl_spark_max_cpp_api")}</a></li>
            <li><a href={"#"} onClick={this.openSamples}>{tt("lbl_spark_max_code_samples")}</a></li>
          </ul>
        </div>
        <div className="form">
          <Button className="rev-btn" onClick={this.viewLogs}>{tt("lbl_view_application_logs")}</Button>
        </div>
        <div className="form update-container">
          <Button className="rev-btn" disabled={checkingForUpdate} loading={checkingForUpdate} onClick={this.checkForUpdates}>{tt("lbl_check_for_updates")}</Button>
        </div>
        {
          downloadingUpdate &&
          <div id={"help-download"}>
            <div className={"fill-w center-items"}>
              {tt("lbl_download_update", {
                bytesPerSecond: ((downloadJSON.bytesPerSecond || 0) / 1000000).toFixed(2),
                transferred: ((downloadJSON.transferred || 0) / 1000000).toFixed(2),
              })}
            </div>
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

  private onProgressUpdate(downloadJSON: any) {
    this.setState({downloadJSON});
  }

  private quitAndUpdate() {
    this.setState({updateAlertOpen: false});
    setTimeout(() => {
      SparkManager.installUpdate();
    }, 500);
  }

  private openJavaDocs() {
    SparkManager.openURL("http://www.revrobotics.com/content/sw/max/sw-docs/java/com/revrobotics/package-summary.html");
  }

  private openCppDocs() {
    SparkManager.openURL("http://www.revrobotics.com/content/sw/max/sw-docs/cpp/index.html");
  }

  private openSamples() {
    SparkManager.openURL("https://github.com/REVrobotics/SPARK-MAX-Examples");
  }

}

export function mapStateToProps(state: IApplicationState) {
  return {
    logs: state.logs
  };
}

export default connect(mapStateToProps)(HelpTab);
