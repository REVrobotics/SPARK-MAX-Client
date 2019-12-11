import classNames from "classnames";
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

interface IDisplayConfigParamFieldGroupProps extends IConfigParamProps {
  inline?: boolean;
  groupClassName?: string;
  fieldClassName?: string;
}

interface IDisplayConfigParamFieldProps extends IConfigParamProps {
  className?: string;
}

const DirtyValidationFormGroup = withDirty(ValidationFormGroup);

const DisplayConfigParamFieldGroup = (props: IDisplayConfigParamFieldGroupProps) => {
  const {inline, fieldClassName, groupClassName, ...other} = props;

  return (
    <DirtyValidationFormGroup {...other}
                              className={classNames("display-param-group", groupClassName)}
                              title={getConfigParamReadableName(props.parameter)}
                              inline={inline}>
      <DisplayConfigParamField {...other} className={fieldClassName}/>
    </DirtyValidationFormGroup>
  );
};

/**
 * Component for configuration parameter used in different places on Run tab
 */
const DisplayConfigParamField = (props: IDisplayConfigParamFieldProps) => {
  const {parameter, className, ...other} = props;
  const {type} = getConfigParamRule(parameter);

  switch (type) {
    case ConfigParamRuleType.Enum:
      return <SelectParamField parameter={parameter}
                               className={classNames("display-param__field--select", className)}
                               {...other}/>;
    case ConfigParamRuleType.Numeric:
      return <NumericParamField parameter={parameter}
                                className={classNames("display-param__field--numeric", className)}
                                {...other}/>;
    case ConfigParamRuleType.Boolean:
      return <SwitchParamField parameter={parameter}
                               className={classNames("display-param__field--boolean", className)}
                               {...other}/>;
    default:
      throw new Error(`Unknown type of field: parameter = "${parameter}", type = "${type}"`)
  }
};

export default bindRamConfigRule(DisplayConfigParamFieldGroup);
