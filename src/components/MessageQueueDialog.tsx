import {Button, Classes, Collapse, Dialog} from "@blueprintjs/core";
import * as React from "react";
import {IMessageQueueConfig} from "../store/state";
import {useCallback, useState} from "react";

interface IProps {
  config: IMessageQueueConfig;
  onClose(): void;
}

/**
 * Dialog with long message console. Message console is displayed in the collapsible area.
 */
const MessageQueueDialog = (props: IProps) => {
  const { config, onClose } = props;

  const [opened, setOpened] = useState(false);
  const toggleDetails = useCallback(() => setOpened(!opened), [opened]);

  return (
    <Dialog className="message-queue" isOpen={true} onClose={onClose} title={config.title}>
      <div className={Classes.DIALOG_BODY}>
        {config.body}
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className="flex-row flex-space-between">
          <Button className="link-button"
                  minimal={true}
                  text={opened ? tt("lbl_hide_details") : tt("lbl_show_details")}
                  icon={opened ? "chevron-up" : "chevron-down"}
                  onClick={toggleDetails}/>
          <Button className="rev-btn" text={tt("lbl_close")} onClick={onClose}/>
        </div>
      </div>
      <div className={opened ? "message-queue__console" : undefined}>
        <Collapse isOpen={opened}>
          <pre>{config.messages.map((message, i) => <p key={i}>{message}</p>)}</pre>
        </Collapse>
      </div>
    </Dialog>
  );
};

export default MessageQueueDialog;
