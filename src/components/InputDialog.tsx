import {Button, Classes, Dialog, FormGroup, InputGroup, Intent} from "@blueprintjs/core";
import * as React from "react";
import {FormEvent, useCallback, useState} from "react";
import Focus from "./Focus";
import {useReplayPipe} from "../utils/react-utils";

interface IProps {
  title: string;
  message: string;
  input: string;
  maxLength?: number;
  okLabel: string;
  cancelLabel: string;
  isOpened: boolean;
  /**
   * Allows to provide custom validations
   */
  validate?: (input: string) => string | undefined;

  onOk(newInput: string): void;

  onCancel(): void;
}

/**
 * {@link InputDialog} declares dialog having a single input and OK/Cancel buttons.
 */
const InputDialog = (props: IProps) => {
  const {input, maxLength, message, title, validate, isOpened, okLabel, cancelLabel, onOk, onCancel} = props;

  const [newInput, setNewInput] = useState(input);
  const ok = useCallback((event?: FormEvent) => {
    if (event) {
      event.preventDefault();
    }
    onOk(newInput);
  }, [newInput]);
  const change = useCallback((event) => setNewInput(event.target.value), []);

  // Run validations
  const isInputEmpty = !newInput;
  let validationError: string | undefined;
  if (isInputEmpty) {
    validationError = tt("msg_name_empty");
  } else if (validate) {
    validationError = validate(newInput);
  }
  const isInputInvalid = validationError != null;

  const intent = isInputInvalid ? Intent.DANGER : undefined;

  // Declares pipe to focus input element
  const [pipe, setRef] = useReplayPipe<any>();

  return (
    <Dialog isOpen={isOpened} onClose={onCancel} title={title}  style={{width: "300px"}}>
      <form onSubmit={ok}>
        <div className={Classes.DIALOG_BODY}>
          <FormGroup className="form-group--with-errors"
                     label={message}
                     labelFor="input"
                     labelInfo="(required)"
                     intent={intent}
                     helperText={validationError}>
            <Focus pipe={pipe} select={true}>
              <InputGroup id="input"
                          type="text"
                          inputRef={setRef}
                          intent={intent}
                          value={newInput}
                          maxLength={maxLength}
                          className="full-width"
                          onChange={change}/>
            </Focus>
          </FormGroup>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button className="rev-btn" type="submit" disabled={isInputInvalid} text={okLabel} onClick={ok}/>
            <Button minimal={true} text={cancelLabel} onClick={onCancel}/>
          </div>
        </div>
      </form>
    </Dialog>
  )
};

export default InputDialog;
