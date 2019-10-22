import {keyBy, memoize} from "lodash";
import * as React from "react";
import {ChangeEvent, useCallback} from "react";
import List from "../components/List";
import ListItem from "../components/ListItem";
import {
  ConfigParam,
  ConfigParamGroupId,
  configParamGroups,
  getConfigParamGroupReadableName,
  getConfigParamReadableName,
  getConfigParamsInGroup
} from "../models/ConfigParam";
import {Checkbox, FormGroup, Icon, Tooltip} from "@blueprintjs/core";
import {IApplicationState} from "../store/state";
import {connect} from "react-redux";
import {setSelectedDeviceDisplayParamGroup, setSelectedDeviceDisplayQuickParam, SparkDispatch} from "../store/actions";
import {querySelectedDeviceDisplay} from "../store/selectors";
import {EMPTY_ARRAY} from "../utils/object-utils";
import bindRamConfigRule from "../hocs/bind-ram-config-rule";
import NumericParamField from "../components/fields/NumericParamField";
import SwitchParamField from "../components/fields/SwitchParamField";
import {getConfigParamRule} from "../store/config-param-rules";
import {ConfigParamRuleType} from "../store/param-rules/ConfigParamRule";
import SelectParamField from "../components/fields/SelectParamField";

interface Props {
  selectedParamGroupId: ConfigParamGroupId;
  quickBar: ConfigParam[];
  onQuickChange(parameter: ConfigParam, quick: boolean): void;
  onSelectParamGroup(paramGroupId: ConfigParamGroupId): void;
}

const CONFIG_PARAMS_NOT_VISIBLE_ON_DISPLAY = keyBy([ConfigParam.kCanID]);
const isConfigParamVisible = (param: ConfigParam) => CONFIG_PARAMS_NOT_VISIBLE_ON_DISPLAY[param] == null;

const getDisplayConfigParamsInGroup = memoize((group) => getConfigParamsInGroup(group).filter(isConfigParamVisible));

interface DisplayConfigParamProps {
  parameter: ConfigParam;
  quick: boolean;
  onQuickChange(parameter: ConfigParam, quick: boolean): void;
}

const DisplayConfigParam = (props: DisplayConfigParamProps) => {
  const {quick, parameter, onQuickChange} = props;

  const quickChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => onQuickChange(parameter, event.target.checked),
    [parameter]);

  return (
    <div className="display-param">
      <Tooltip content={quick ? tt("lbl_remove_from_quick_bar") : tt("lbl_add_to_quick_bar")}>
        <Checkbox className="display-param__quick"
                  checked={quick}
                  onChange={quickChange}/>
      </Tooltip>
      <FormGroup inline={true} className="display-param__group" label={getConfigParamReadableName(parameter)}>
        <DisplayConfigParamField parameter={parameter}/>
      </FormGroup>
    </div>
  );
};

interface DisplayConfigParamFieldProps {
  parameter: ConfigParam;
}

const DisplayConfigParamField = (props: DisplayConfigParamFieldProps) => {
  const {parameter} = props;
  const {type} = getConfigParamRule(parameter);

  switch (type) {
    case ConfigParamRuleType.Enum:
      return <DisplayConfigParamSelectField className="display-param__field--select" parameter={parameter}/>;
    case ConfigParamRuleType.Numeric:
      return <DisplayConfigParamNumericField className="display-param__field--numeric" parameter={parameter}/>;
    case ConfigParamRuleType.Boolean:
      return <DisplayConfigParamBooleanField className="display-param__field--boolean" parameter={parameter}/>;
    default:
      throw new Error(`Unknown type of field: parameter = "${parameter}", type = "${type}"`)
  }
};

const DisplayConfigParamSelectField = bindRamConfigRule(SelectParamField);
const DisplayConfigParamNumericField = bindRamConfigRule(NumericParamField);
const DisplayConfigParamBooleanField = bindRamConfigRule(SwitchParamField);

const ParametersRunPanel = (props: Props) => {
  const {quickBar, selectedParamGroupId, onSelectParamGroup, onQuickChange} = props;

  const quickIndex = keyBy(quickBar);

  return (
    <div className="flex-row full-width no-wrap">
      <List className="param-group-list" selected={selectedParamGroupId} onSelect={onSelectParamGroup}>
        {configParamGroups.map((paramGroup) =>
          <ListItem key={paramGroup}
                    value={paramGroup}
                    title={getConfigParamGroupReadableName(paramGroup)}
                    options={
                      paramGroup === selectedParamGroupId ?
                        <Icon icon="double-chevron-right" iconSize={14} className="active-list-item-icon"/>
                        : null
                    }>
            {getConfigParamGroupReadableName(paramGroup)}
          </ListItem>)}
      </List>
      <div className="flex-1 flex-column display-param-list">
        {getDisplayConfigParamsInGroup(selectedParamGroupId).map((param) =>
          <DisplayConfigParam key={param}
                              parameter={param}
                              quick={quickIndex[param] != null}
                              onQuickChange={onQuickChange}/>)}
      </div>
    </div>
  );
};

const mapStateToProps = (state: IApplicationState) => {
  const display = querySelectedDeviceDisplay(state);

  return {
    selectedParamGroupId: display ? display.selectedParamGroupId : undefined,
    quickBar: display ? display.quickBar : EMPTY_ARRAY,
  };
};

const mapDispatchToProps = (dispatch: SparkDispatch) => {
  return {
    onQuickChange: (param: ConfigParam, quick: boolean) => dispatch(setSelectedDeviceDisplayQuickParam(param, quick)),
    onSelectParamGroup: (paramGroupId: ConfigParamGroupId) => dispatch(setSelectedDeviceDisplayParamGroup(paramGroupId)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ParametersRunPanel);
