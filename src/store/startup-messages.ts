import {flatMap} from "lodash";
import {Message} from "./state";
import {DeviceConfigValidationResult} from "./device-config/device-config-validator";

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
    section("Some device configurations have unrecoverable errors"),
    ...flatMap(validationResults, (config) => [
      title(`Device configuration is invalid: ${config.configuration.filePath}`),
      ...config.violations.map(({message}) => fromMessage(message)),
    ]),
  ];
};

export const createMessagesForFixedConfigurations = (validationResults: DeviceConfigValidationResult[]) => {
  if (validationResults.length === 0) {
    return [];
  }

  return [
    section("Some device configurations have errors", "but were recovered as much as possible"),
    ...flatMap(validationResults, (config) => [
      title(`Recovered device configuration: ${config.configuration.filePath}`),
      ...config.violations.map(({message}) => fromMessage(message)),
    ]),
  ];
};
