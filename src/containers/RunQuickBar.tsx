import classNames from "classnames";
import * as React from "react";
import {useCallback} from "react";
import {IApplicationState, QuickPanelName} from "../store/state";
import {connect} from "react-redux";
import {setDisplaySelectedQuickPanel, setSelectedDeviceDisplayPidProfile, SparkDispatch} from "../store/actions";
import {ConfigParam} from "../models/ConfigParam";
import {Button, FormGroup, Tab, Tabs} from "@blueprintjs/core";
import DisplayConfigParamFieldGroup from "./DisplayConfigParamFieldGroup";
import {queryDisplay, querySelectedDeviceDisplay} from "../store/selectors";
import {EMPTY_ARRAY} from "../utils/object-utils";
import {setAndPersistSelectedDeviceDisplayQuickParam} from "../store/actions/display-actions";
import DictionarySelect from "../components/DictionarySelect";
import {PID_PROFILES} from "../store/dictionaries";

interface IProps {
  className?: string;
  quickBar: ConfigParam[];
  panel: QuickPanelName;
  pidProfile: number;

  onSelectPidProfile(profile: number): void;
  onSelectQuickPanel(panel: QuickPanelName): void;
  onQuickUnset(parameter: ConfigParam): void;
}

interface IQuickParameterProps {
  parameter: ConfigParam;
  onQuickUnset(parameter: ConfigParam): void;
}

const QuickParameter = (props: IQuickParameterProps) => {
  const {parameter, onQuickUnset} = props;

  const quickUnset = useCallback(() => onQuickUnset(parameter), [parameter]);

  return (
    <div className="display-param">
      <Button title={tt("lbl_remove_from_quick_bar")}
              minimal={true}
              small={true}
              icon="cross"
              onClick={quickUnset}/>
      <DisplayConfigParamFieldGroup parameter={parameter} inline={true}  disabled={true}/>
    </div>
  );
};

/**
 * Component displaying panel for *PIDF" parameters
 */
const PIDFPanel = (props: IProps) => {
  const pParam = ConfigParam.kP_0 + props.pidProfile * 8;

  return (
    <div className="flex-column">
      <FormGroup inline={true} label={tt("lbl_pid_profile")}>
        <DictionarySelect dictionary={PID_PROFILES}
                          value={props.pidProfile}
                          disabled={true}
                          onValueChange={props.onSelectPidProfile}/>
      </FormGroup>
      <div className="run-quick-bar__pid-row flex-row">
        <DisplayConfigParamFieldGroup parameter={pParam} groupClassName="display-param-group--minimal"
                                      disabled={true}/>
        <DisplayConfigParamFieldGroup parameter={pParam + 1} groupClassName="display-param-group--minimal"
                                      disabled={true}/>
        <DisplayConfigParamFieldGroup parameter={pParam + 2} groupClassName="display-param-group--minimal"
                                      disabled={true}/>
      </div>
      <div className="run-quick-bar__pid-row flex-row">
        <DisplayConfigParamFieldGroup parameter={pParam + 3} groupClassName="display-param-group--minimal"
                                      disabled={true}/>
      </div>
    </div>
  );
};

/**
 * Component displaying parameters marked as `quick` on "Parameters" panel
 */
const QuickBarPanel = (props: IProps) => {
  const {onQuickUnset} = props;

  return (
    <>
      {
        props.quickBar.map((parameter) =>
          <QuickParameter key={parameter} parameter={parameter} onQuickUnset={onQuickUnset}/>)
      }
    </>
  );
};

/**
 * Quick bar component displayed on "Run" panel of "Run Tab".
 * This component allows quick access to the most used parameters.
 */
const RunQuickBar = (props: IProps) => {
  return (
    <Tabs className={classNames("run-quick-bar", props.className)}
          selectedTabId={props.panel}
          onChange={props.onSelectQuickPanel}
          renderActiveTabPanelOnly={true}>
      <Tab id={QuickPanelName.PIDF}
           title={tt("lbl_pidf")}
           panel={<PIDFPanel {...props}/>}/>
      <Tab id={QuickPanelName.Quick}
           title={tt("lbl_quick_bar")}
           panel={<QuickBarPanel {...props}/>}/>
    </Tabs>
  );
};

const mapStateToProps = (state: IApplicationState) => {
  const display = queryDisplay(state);
  const deviceDisplay = querySelectedDeviceDisplay(state);
  return {
    panel: display.selectedQuickPanel,
    pidProfile: deviceDisplay ? deviceDisplay.pidProfile : 0,
    quickBar: deviceDisplay ? deviceDisplay.quickBar : EMPTY_ARRAY,
  };
};
const mapDispatchToProps = (dispatch: SparkDispatch) => {
  return {
    onSelectQuickPanel: (panel: QuickPanelName) => dispatch(setDisplaySelectedQuickPanel(panel)),
    onSelectPidProfile: (profile: number) => dispatch(setSelectedDeviceDisplayPidProfile(profile)),
    onQuickUnset: (param: ConfigParam) => dispatch(setAndPersistSelectedDeviceDisplayQuickParam(param, false)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(RunQuickBar);
