/**
 * This module declares validations shown on application startup in the message queue.
 */

import {flatMap} from "lodash";
import {DeviceConfigValidationResult} from "./device-config/device-config-validator";
import {Message} from "../models/Message";

const section = (...text: string[]) => text.map((t) => `====== ${t}`).join("\n");
const title = (...text: string[]) => text.map((t) => `*** ${t}`).join("\n");
// const info = (text: string) => text;
const fromMessage = (msg: Message) => `> ${msg.text}`;
// const emptyLine = () => "\n";

export const createMessagesForNotFixedConfigurations = (validationResults: DeviceConfigValidationResult[]) => {
  if (validationResults.length === 0) {
    return [];
  }

  return [
    section(tt("msg_startup_device_unrecoverable_errors")),
    ...flatMap(validationResults, (config) => [
      title(tt("msg_startup_device_invalid_configuration", { filePath: config.configuration.filePath })),
      ...config.violations.map(({message}) => fromMessage(message)),
    ]),
  ];
};

export const createMessagesForFixedConfigurations = (validationResults: DeviceConfigValidationResult[]) => {
  if (validationResults.length === 0) {
    return [];
  }

  return [
    section(tt("msg_startup_device_recovered_errors")),
    ...flatMap(validationResults, (config) => [
      title(tt("msg_startup_device_recovered_configuration", { filePath: config.configuration.filePath })),
      ...config.violations.map(({message}) => fromMessage(message)),
    ]),
  ];
};
