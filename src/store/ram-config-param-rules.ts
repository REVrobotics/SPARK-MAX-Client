import {without} from "lodash";
import {IConfigParamContext, mapRule, mapRuleRegistry} from "./param-rules/ConfigParamRule";
import {IApplicationState, Message} from "./state";
import {ConfigParam, ParamStatus} from "../models/proto-gen/SPARK-MAX-Types_dto_pb";
import {queryConnectedDevicesByCanId, querySelectedDevice, querySelectedDeviceCurrentConfig} from "./selectors";
import {substitute} from "../utils/string-utils";
import {getConfigParamRule} from "./config-param-rules";
import {getDeviceParamOrDefault, getDeviceParamValueOrDefault} from "./param-rules/config-param-helpers";

const MESSAGE_CAN_0 = "For proper operation of the SPARK MAX, please change all SPARK MAX CAN IDs from 0 to any unused ID from 1 to 62.";
const MESSAGE_NOT_CONFIGURED_DEVICE = "To work with SPARK MAX controller, configure it by setting unique CAN ID on the bus";
const MESSAGE_NOT_UNIQUE_CAN_ID = "Device having id $id already exists. Assign unique CAN ID, please";

export interface IRamConfigParamContext extends IConfigParamContext {
  getState(): IApplicationState;
}

export const createRamConfigParamContext = (state: IApplicationState): IRamConfigParamContext => ({
  getState: () => state,
  getParameter: (param: ConfigParam) => getDeviceParamValueOrDefault(querySelectedDeviceCurrentConfig(state), param),
});

/**
 * Returns registry for {@link IConfigParamRule}s suitable to work with stored in RAM values.
 */
export const getRamConfigParamRule = mapRuleRegistry(getConfigParamRule, [
  // Implement validations for in-RAM parameters
  mapRule((rule) => ({
    ...rule,
    validate: (ctx: IRamConfigParamContext) => {
      const state = ctx.getState();

      let warning: Message | undefined;

      // Run default validation flow
      const message = rule.validate(ctx);
      if (message) {
        return message;
      }

      // Analyze the latest response that came from the server
      const param = getDeviceParamOrDefault(querySelectedDeviceCurrentConfig(state), rule.id);
      const {lastResponse} = param;
      if (lastResponse && lastResponse.status === ParamStatus.Invalid) {
        warning = Message.warning(`Your requested value of ${lastResponse.requestValue} was invalid, so the SPARK MAX controller sent back a value of ${lastResponse.responseValue}.`);
      }

      return warning;
    },
    /**
     * Return the latest validation message
     * @param ctx
     */
    getMessage: (ctx: IRamConfigParamContext): Message | undefined => {
      const param = getDeviceParamOrDefault(querySelectedDeviceCurrentConfig(ctx.getState()), rule.id);
      return param.message;
    },
  })),
  // Implement additional validations for CAN ID field
  mapRule(ConfigParam.kCanID, (rule) => ({
    ...rule,
    validate: (ctx: IRamConfigParamContext) => {
      const value = ctx.getParameter(ConfigParam.kCanID);
      const state = ctx.getState();

      const device = querySelectedDevice(state)!;
      if (value === 0 && device.uniqueId !== 0) {
        // Generate error if device is not configured
        return Message.error(MESSAGE_NOT_CONFIGURED_DEVICE);
      } else if (without(queryConnectedDevicesByCanId(state, value), device).length > 0) {
        // Generate error if CAN ID is not unique on the bus
        return Message.error(substitute(MESSAGE_NOT_UNIQUE_CAN_ID, {id: String(value)}));
      } else if (value === 0) {
        // Generate warning if device is a single device having CAN ID = 0
        return Message.warning(MESSAGE_CAN_0);
      }

      // Run other validations
      return rule.validate(ctx);
    },
  })),
]);
