import {Alert, Button, FormGroup, InputGroup} from "@blueprintjs/core";
import * as React from "react";

interface IState {
  updateDialogOpen: boolean
}

class SettingsTab extends React.Component<{}, IState> {
  constructor({}) {
    super({});

    this.state = {
      updateDialogOpen: false
    };

    this.closeUpdateModal = this.closeUpdateModal.bind(this);
    this.openUpdateModal = this.openUpdateModal.bind(this);

  }

  public render() {
    const {updateDialogOpen} = this.state;
    return (
      <div>
        <Alert isOpen={updateDialogOpen} cancelButtonText="Cancel" confirmButtonText="Yes, Update" intent="success" onCancel={this.closeUpdateModal} onClose={this.closeUpdateModal} onConfirm={this.updateServerConfig}>
          Are you sure you want to update the SPARK MAX server configuration?
        </Alert>
        <div className="form">
          <div className="form-group-row">
            <div className="form-group-row-left">
              <FormGroup
                label="Remote IP"
                labelFor="settings-ip-address"
                className="form-group-half"
              >
                <InputGroup id="settings-ip-address"/>
              </FormGroup>
              <FormGroup
                label="Remote Port"
                labelFor="settings-port"
                className="form-group-quarter"
              >
                <InputGroup id="settings-port"/>
              </FormGroup>
            </div>
            <div className="form-group-row-right">
              <Button className="rev-btn" onClick={this.openUpdateModal}>Update</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  private closeUpdateModal() {
    this.setState({updateDialogOpen: false});
  }

  private openUpdateModal() {
    this.setState({updateDialogOpen: true});
  }

  private updateServerConfig() {
    console.log("you did it!");
  }
}


export default SettingsTab;