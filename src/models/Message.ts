import {substitute} from "../utils/string-utils";
import {Intent} from "@blueprintjs/core";

export enum MessageSeverity {
  Info = "info",
  Error = "error",
  Warning = "warning"
}

const SEVERITY_TO_INTENT = {
  [MessageSeverity.Error]: Intent.DANGER,
  [MessageSeverity.Info]: Intent.NONE,
  [MessageSeverity.Warning]: Intent.WARNING,
};

/**
 * Converts severity level to {@link Intent}
 */
export const severityToIntent = (severity: MessageSeverity): Intent => SEVERITY_TO_INTENT[severity];

// tslint:disable-next-line:interface-over-type-literal
export type MessageParams = { [name: string]: any };

/**
 * Message encapsulates some validation result having severity and text
 */
export class Message {
  public static create(severity: MessageSeverity, id: string, params?: MessageParams): Message {
    return new Message(severity, id, params);
  }

  public static info(id: string, params?: MessageParams): Message {
    return Message.create(MessageSeverity.Info, id, params);
  }

  public static error(id: string, params?: MessageParams): Message {
    return Message.create(MessageSeverity.Error, id, params);
  }

  public static warning(id: string, params?: MessageParams): Message {
    return Message.create(MessageSeverity.Warning, id, params);
  }

  public static infoFromText(text: string): Message {
    return Message.create(MessageSeverity.Info, "text", {text});
  }

  public static errorFromText(text: string): Message {
    return Message.create(MessageSeverity.Error, "text", {text});
  }

  public static warningFromText(text: string): Message {
    return Message.create(MessageSeverity.Warning, "text", {text});
  }

  private _text?: string;

  private constructor(readonly severity: MessageSeverity, readonly id: string, readonly params?: MessageParams) {
  }

  get text(): string {
    if (this._text == null) {
      const text = tt(this.id);
      this._text = this.params ? substitute(text, this.params) : text;
    }
    return this._text;
  }

  set text(_: string) {
    throw new Error("Text of Message cannot be changed");
  }
}
