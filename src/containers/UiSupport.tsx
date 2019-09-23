import * as React from "react";
import {ConfirmationAnswer, IApplicationState, IConfirmationDialogConfig} from "../store/state";
import {connect} from "react-redux";
import {answerConfirmation, closeConfirmation, SparkDispatch} from "../store/actions";
import {Alert} from "@blueprintjs/core";

interface IProps {
  confirmation?: IConfirmationDialogConfig;
  confirmationOpened: boolean;
  confirmationYes(): void;
  confirmationCancel(): void;
  confirmationClose(): void;
}

class UiSupport extends React.Component<IProps> {
  public render() {
    const { confirmation, confirmationOpened, confirmationYes, confirmationCancel, confirmationClose } = this.props;

    let alert = null;
    if (confirmationOpened && confirmation) {
      alert = <Alert
        isOpen={confirmationOpened}
        cancelButtonText={confirmation.cancelLabel}
        confirmButtonText={confirmation.yesLabel}
        intent="success"
        onCancel={confirmationCancel}
        onClose={confirmationClose}
        onConfirm={confirmationYes}
      >{confirmation.text}</Alert>;
    }

    return <React.Fragment>{ confirmationOpened ? alert : null}</React.Fragment>;
  }
}

function mapStateToProps(state: IApplicationState) {
  const { ui: {confirmationOpened, confirmation} } = state;
  return {
    confirmation, confirmationOpened,
  }
}

function mapDispatchToProps(dispatch: SparkDispatch) {
  return {
    confirmationYes: () => dispatch(answerConfirmation(ConfirmationAnswer.Yes)),
    confirmationCancel: () => dispatch(answerConfirmation(ConfirmationAnswer.Cancel)),
    confirmationClose: () => dispatch(closeConfirmation()),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UiSupport);
