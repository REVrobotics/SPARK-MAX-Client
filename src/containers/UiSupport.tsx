import * as React from "react";
import {
  ConfirmationAnswer,
  IAlertDialogConfig,
  IApplicationState,
  IConfirmationDialogConfig,
  IMessageQueueConfig
} from "../store/state";
import {connect} from "react-redux";
import {answerConfirmation, closeAlert, closeConfirmation, setToasterRef, SparkDispatch} from "../store/actions";
import {Alert, Toaster} from "@blueprintjs/core";
import {queryIsMessageQueueOpened, queryMessageQueueConfig} from "../store/selectors";

interface IProps {
  alert?: IAlertDialogConfig;
  alertOpened: boolean;
  confirmation?: IConfirmationDialogConfig;
  confirmationOpened: boolean;
  messageQueue?: IMessageQueueConfig;
  messageQueueOpened: boolean;
  alertClose(): void;
  confirmationYes(): void;
  confirmationCancel(): void;
  confirmationClose(): void;
  messageQueueClose(): void;
}

class UiSupport extends React.Component<IProps> {
  public render() {
    const {
      alert, alertOpened, alertClose,
      confirmation, confirmationOpened, confirmationYes, confirmationCancel, confirmationClose,
      messageQueueOpened, messageQueue, messageQueueClose,
    } = this.props;

    let alertDialog = null;
    if (alertOpened && alert) {
      alertDialog = (
        <Alert
          key="alert"
          isOpen={alertOpened}
          confirmButtonText={alert.okLabel}
          intent={alert.intent}
          onClose={alertClose}
          onConfirm={alertClose}
        >{alert.text || alert.content}</Alert>
      );
    }

    let confirmationDialog = null;
    if (confirmationOpened && confirmation) {
      confirmationDialog = (
        <Alert
          key="confirmation"
          isOpen={confirmationOpened}
          cancelButtonText={confirmation.cancelLabel}
          confirmButtonText={confirmation.yesLabel}
          intent={confirmation.intent}
          onCancel={confirmationCancel}
          onClose={confirmationClose}
          onConfirm={confirmationYes}
        >{confirmation.text}</Alert>
      );
    }

    let messageQueueDialog = null;
    if (messageQueueOpened && messageQueue) {
      messageQueueDialog = <MessageQueueDialog config={messageQueue} onClose={messageQueueClose}/>;
    }

    return (
      <>
        <Toaster ref={setToasterRef}/>
        { confirmationOpened ? confirmationDialog : null}
        { alertOpened ? alertDialog : null }
        { messageQueueOpened ? messageQueueDialog : null}
      </>
    );
  }
}

function mapStateToProps(state: IApplicationState) {
  const { ui: {alert, alertOpened, confirmationOpened, confirmation} } = state;
  return {
    alert,
    alertOpened,
    confirmation,
    confirmationOpened,
    messageQueueOpened: queryIsMessageQueueOpened(state),
    messageQueue: queryMessageQueueConfig(state),
  }
}

function mapDispatchToProps(dispatch: SparkDispatch) {
  return {
    alertClose: () => dispatch(closeAlert()),
    confirmationYes: () => dispatch(answerConfirmation(ConfirmationAnswer.Yes)),
    confirmationCancel: () => dispatch(answerConfirmation(ConfirmationAnswer.Cancel)),
    confirmationClose: () => dispatch(closeConfirmation()),
    messageQueueClose: () => dispatch(closeMessageQueue()),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UiSupport);
