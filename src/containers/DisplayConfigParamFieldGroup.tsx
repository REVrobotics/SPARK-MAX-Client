import bindRamConfigRule from "../hocs/bind-ram-config-rule";
import {withDirty} from "../hocs/with-dirty";
import ValidationFormGroup from "../components/groups/ValidationFormGroup";
import {getConfigParamRule} from "../store/config-param-rules";
import {ConfigParamRuleType} from "../store/param-rules/ConfigParamRule";
import SelectParamField from "../components/fields/SelectParamField";
import NumericParamField from "../components/fields/NumericParamField";
import SwitchParamField from "../components/fields/SwitchParamField";
import * as React from "react";
import {IConfigParamProps} from "../components/config-param-props";
import {getConfigParamReadableName} from "../models/ConfigParam";

const DisplayConfigParamFieldGroup = (props: IConfigParamProps) => {
  return (
    <ValidationFormGroup {...props}
                         className="display-param-group"
                         title={getConfigParamReadableName(props.parameter)}
                         inline={true}>
      <DisplayConfigParamField {...props}/>
    </ValidationFormGroup>
  );
};

const DisplayConfigParamField = (props: IConfigParamProps) => {
  const {parameter} = props;
  const {type} = getConfigParamRule(parameter);

  switch (type) {
    case ConfigParamRuleType.Enum:
      return <SelectParamField {...props} className="display-param__field--select"/>;
    case ConfigParamRuleType.Numeric:
      return <NumericParamField {...props} className="display-param__field--numeric"/>;
    case ConfigParamRuleType.Boolean:
      return <SwitchParamField {...props} className="display-param__field--boolean"/>;
    default:
      throw new Error(`Unknown type of field: parameter = "${parameter}", type = "${type}"`)
  }
};

export default bindRamConfigRule(withDirty(DisplayConfigParamFieldGroup));
