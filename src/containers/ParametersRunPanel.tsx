import {keyBy, memoize} from "lodash";
import * as React from "react";
import {ChangeEvent, useCallback} from "react";
import List from "../components/List";
import ListItem from "../components/ListItem";
import {
  ConfigParam,
  ConfigParamGroupId, configParamVisibleGroups,
  getConfigParamGroupReadableName,
  getConfigParamsInGroup
} from "../models/ConfigParam";
import {Checkbox, Icon, Tooltip} from "@blueprintjs/core";
import {IApplicationState} from "../store/state";
import {connect} from "react-redux";
import {setSelectedDeviceDisplayParamGroup, SparkDispatch} from "../store/actions";
import {querySelectedDeviceDisplay} from "../store/selectors";
import {EMPTY_ARRAY} from "../utils/object-utils";
import DisplayConfigParamFieldGroup from "./DisplayConfigParamFieldGroup";
import {setAndPersistSelectedDeviceDisplayQuickParam} from "../store/actions/display-actions";

interface Props {
  selectedParamGroupId: ConfigParamGroupId;
  quickBar: ConfigParam[];
  onQuickChange(parameter: ConfigParam, quick: boolean): void;
  onSelectParamGroup(paramGroupId: ConfigParamGroupId): void;
}

const CONFIG_PARAMS_NOT_VISIBLE_ON_DISPLAY = keyBy([ConfigParam.kCanID]);
const isConfigParamVisible = (param: ConfigParam) => CONFIG_PARAMS_NOT_VISIBLE_ON_DISPLAY[param] == null;

const getDisplayConfigParamsInGroup = memoize((group) => getConfigParamsInGroup(group).filter(isConfigParamVisible));

interface GroupParameterProps {
  parameter: ConfigParam;
  quick: boolean;
  onQuickChange(parameter: ConfigParam, quick: boolean): void;
}

const GroupParameter = (props: GroupParameterProps) => {
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
      <DisplayConfigParamFieldGroup parameter={parameter} inline={true}/>
    </div>
  );
};

/**
 * Component for "Parameters" panel of "Run Tab"
 */
const ParametersRunPanel = (props: Props) => {
  const {quickBar, selectedParamGroupId, onSelectParamGroup, onQuickChange} = props;

  const quickIndex = keyBy(quickBar);

  return (
    <div className="flex-row full-width no-wrap">
      <List className="param-group-list" selected={selectedParamGroupId} onSelect={onSelectParamGroup}>
        {configParamVisibleGroups.map((paramGroup) =>
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
          <GroupParameter key={param}
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
    quickBar: display && display.quickBar ? display.quickBar : EMPTY_ARRAY,
  };
};

const mapDispatchToProps = (dispatch: SparkDispatch) => {
  return {
    onQuickChange: (param: ConfigParam, quick: boolean) =>
      dispatch(setAndPersistSelectedDeviceDisplayQuickParam(param, quick)),
    onSelectParamGroup: (paramGroupId: ConfigParamGroupId) => dispatch(setSelectedDeviceDisplayParamGroup(paramGroupId)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ParametersRunPanel);
