import classNames from "classnames";
import * as React from "react";
import {useCallback} from "react";
import {IApplicationState} from "../store/state";
import {connect} from "react-redux";
import {SparkDispatch} from "../store/actions";
import {ConfigParam} from "../models/ConfigParam";
import {Button} from "@blueprintjs/core";
import DisplayConfigParamFieldGroup from "./DisplayConfigParamFieldGroup";
import {querySelectedDeviceDisplay} from "../store/selectors";
import {EMPTY_ARRAY} from "../utils/object-utils";
import {setAndPersistSelectedDeviceDisplayQuickParam} from "../store/actions/display-actions";

interface IProps {
  className?: string;
  quickBar: ConfigParam[];

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
      <DisplayConfigParamFieldGroup parameter={parameter}/>
    </div>
  );
};

const RunQuickBar = (props: IProps) => {
  const {onQuickUnset} = props;

  return (
    <div className={classNames("run-quick-bar", props.className)}>
      <div className="run-quick-bar__header">{tt("lbl_quick_bar")}</div>
      <div className="run-quick-bar__body">
        {
          props.quickBar.map((parameter) =>
            <QuickParameter key={parameter} parameter={parameter} onQuickUnset={onQuickUnset}/>)
        }
      </div>
    </div>
  );
};

const mapStateToProps = (state: IApplicationState) => {
  const display = querySelectedDeviceDisplay(state);
  return {
    quickBar: display ? display.quickBar : EMPTY_ARRAY,
  };
};
const mapDispatchToProps = (dispatch: SparkDispatch) => {
  return {
    onQuickUnset: (param: ConfigParam) => dispatch(setAndPersistSelectedDeviceDisplayQuickParam(param, false)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(RunQuickBar);
