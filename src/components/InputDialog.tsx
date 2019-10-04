import {Button, Classes, Dialog, FormGroup} from "@blueprintjs/core";
import * as React from "react";
import {useCallback, useState} from "react";

interface IProps {
  title: string;
  message: string;
  input: string;
  maxLength?: number;
  okLabel: string;
  cancelLabel: string;
  isOpened: boolean;

  onOk(newInput: string): void;

  onCancel(): void;
}

const InputDialog = (props: IProps) => {
  const {input, maxLength, message, title, isOpened, okLabel, cancelLabel, onOk, onCancel} = props;

  const [newInput, setNewInput] = useState(input);
  const ok = useCallback(() => onOk(newInput), [newInput]);
  const change = useCallback((event) => setNewInput(event.target.value), []);

  return (
    <Dialog isOpen={isOpened} title={title}>
      <div className={Classes.DIALOG_BODY}>
        <FormGroup label={message} labelFor="input">
          <input id="input" type="text" maxLength={maxLength} className={Classes.INPUT} onChange={change}/>
        </FormGroup>
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button text={okLabel} onClick={ok}/>
          <Button text={cancelLabel} onClick={onCancel}/>
        </div>
      </div>
    </Dialog>
  )
};

export default InputDialog;
