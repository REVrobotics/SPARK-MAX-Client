import classNames from "classnames";
import * as React from "react";
import {ChangeEvent, ReactNode, useCallback, useMemo} from "react";
import {getSignalId, IApplicationState, ISignalInstanceState, ISignalState, SignalId} from "../store/state";
import {connect} from "react-redux";
import List from "../components/List";
import {setSelectedDeviceSignal, SparkDispatch} from "../store/actions";
import {querySelectedDeviceAssignedSignals, querySelectedSignalIdForSelectedDevice, querySelectedDeviceSignals} from "../store/selectors";
import {
  addSelectedDeviceSignal,
  removeSelectedDeviceSignal,
  setSelectedDeviceSignalField
} from "../store/actions/display-actions";
import {Button, Checkbox, FormGroup, Icon, Intent, NonIdealState} from "@blueprintjs/core";
import ListItem from "../components/ListItem";
import SafeNumericInput, {SafeNumericBehavior} from "../components/SafeNumericInput";

interface Props {
  selectedSignalId?: SignalId;
  selectedSignal?: ISignalInstanceState;
  signals: ISignalState[];
  assignedSignals: { [name: string]: ISignalInstanceState };

  onSignalSelect(id: SignalId): void;

  onSignalAdd(id: SignalId): void;

  onSignalRemove(id: SignalId): void;

  setSignalField(id: SignalId, key: keyof ISignalInstanceState, value: any): void;
}

interface SignalProps {
  value: SignalId;
  signal: ISignalState;
  assigned: boolean;
  active?: boolean;

  onAdd(id: SignalId): void;

  onRemove(id: SignalId): void;

  onClick?(): void;
}

const Signal = (props: SignalProps) => {
  const {signal, assigned, active, onRemove, onAdd} = props;

  const add = useCallback(() => onAdd(getSignalId(signal)), []);
  const remove = useCallback(() => onRemove(getSignalId(signal)), []);

  let button: ReactNode;
  if (active) {
    button = <Icon icon="double-chevron-right" iconSize={14} className="active-list-item-icon"/>;
  } else if (assigned) {
    button = <Button icon="trash" minimal={true} title={tt("lbl_delete_signal")} onClick={remove}/>;
  } else {
    button = <Button icon="small-plus" minimal={true} title={tt("lbl_add_signal")} onClick={add}/>;
  }

  return (
    <ListItem key={signal.id}
              value={signal.id}
              active={active}
              title={signal.name}
              options={button}
              onClick={props.onClick}>
      {signal.name}
    </ListItem>
  );
};

interface SignalPaneProps {
  className?: string;
  signal?: ISignalState;
  instance?: ISignalInstanceState;

  onAdd(id: SignalId): void;

  onRemove(id: SignalId): void;

  onSetField(id: SignalId, key: keyof ISignalInstanceState, value: any): void;
}

/**
 * This component displays signal-specific settings
 */
const SignalAssignedPane = (props: SignalPaneProps) => {
  const {className, onRemove, onSetField} = props;
  const signal = props.signal!;
  const instance = props.instance!;

  const autoScaleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => onSetField(getSignalId(signal), "autoScaled", event.target.checked),
    [signal]);

  const minChange = useCallback((value) => onSetField(getSignalId(signal), "min", value), [signal]);
  const maxChange = useCallback((value) => onSetField(getSignalId(signal), "max", value), [signal]);

  const remove = useCallback(() => onRemove(getSignalId(signal)), [signal]);

  return (
    <div className={classNames("form-column p-10", className)}>
      <div className="flex-row flex-cross-center">
        <Checkbox checked={instance.autoScaled} onChange={autoScaleChange}>{tt("lbl_auto_scaled")}</Checkbox>
        <div className="flex-column">
          <FormGroup inline={true}
                     disabled={instance.autoScaled}
                     contentClassName="unit-group"
                     label={tt("lbl_min")} labelFor="limit">
            <div className="flex-row">
              <SafeNumericInput id="limit"
                                disabled={instance.autoScaled}
                                safeBehavior={SafeNumericBehavior.Clamp}
                                min={0}
                                value={instance.min}
                                safeInvalidValue={instance.min}
                                onValueChange={minChange}/>
              <div className="unit-group__unit">{signal.units}</div>
            </div>
          </FormGroup>
          <FormGroup inline={true}
                     disabled={instance.autoScaled}
                     contentClassName="unit-group"
                     label={tt("lbl_max")} labelFor="limit">
            <div className="flex-row">
              <SafeNumericInput id="limit"
                                disabled={instance.autoScaled}
                                safeBehavior={SafeNumericBehavior.Clamp}
                                value={instance.max}
                                safeInvalidValue={instance.max}
                                onValueChange={maxChange}/>
              <div className="unit-group__unit">{signal.units}</div>
            </div>
          </FormGroup>
        </div>
      </div>
      <Button type="button" text={tt("lbl_delete_signal")} icon="trash" intent={Intent.DANGER} onClick={remove}/>
    </div>
  );
};

const SignalNotAssignedPane = (props: SignalPaneProps) => {
  const {className, onAdd} = props;
  const signal = props.signal!;

  const add = useCallback(() => onAdd(getSignalId(signal)), [signal]);

  return (
    <NonIdealState className={classNames(className, "p-20")}
                   icon="plus"
                   title={tt("lbl_add_signal_title")}
                   description={tt("lbl_add_signal_description")}
                   action={<Button text={tt("lbl_add_signal")} className="rev-btn" onClick={add}/>}/>
  );
};

const SignalPane = (props: SignalPaneProps) => {
  const {className, signal, instance} = props;

  if (signal == null) {
    return (
      <NonIdealState className={classNames(className, "p-20")}
                     icon="property"
                     title={tt("lbl_no_signal_selected_title")}
                     description={tt("lbl_no_signal_selected_description")}/>
    );
  }

  if (instance == null) {
    return <SignalNotAssignedPane {...props}/>;
  }

  return <SignalAssignedPane {...props}/>;
};

/**
 * Component for "Signals" panel of "Run Tab"
 */
const SignalsRunPanel = (props: Props) => {
  const {selectedSignalId, signals, assignedSignals, onSignalSelect, onSignalAdd, onSignalRemove, setSignalField} = props;

  const selectedSignal = useMemo(
    () => signals.find((signal) => getSignalId(signal) === selectedSignalId),
    [selectedSignalId, signals]);

  const selectSignal = useCallback((signalId) => onSignalSelect(signalId), []);

  return (
    <div className="flex-row full-width">
      <List className="signal-list" selected={selectedSignalId} onSelect={selectSignal}>
        {signals.map((signal) =>
          <Signal key={signal.id}
                  signal={signal}
                  value={getSignalId(signal)}
                  assigned={!!assignedSignals[signal.id!]}
                  onAdd={onSignalAdd}
                  onRemove={onSignalRemove}/>)}
      </List>
      <SignalPane className="flex-1"
                  signal={selectedSignal}
                  instance={selectedSignalId ? assignedSignals[selectedSignalId] : undefined}
                  onAdd={onSignalAdd}
                  onRemove={onSignalRemove}
                  onSetField={setSignalField}/>
    </div>
  );
};

const mapStateToProps = (state: IApplicationState) => {
  return {
    selectedSignalId: querySelectedSignalIdForSelectedDevice(state),
    signals: querySelectedDeviceSignals(state),
    assignedSignals: querySelectedDeviceAssignedSignals(state),
  };
};

const mapDispatchToProps = (dispatch: SparkDispatch) => {
  return {
    onSignalSelect: (signalId: SignalId) => dispatch(setSelectedDeviceSignal(signalId)),
    onSignalAdd: (signalId: SignalId) => dispatch(addSelectedDeviceSignal(signalId)),
    onSignalRemove: (signalId: SignalId) => dispatch(removeSelectedDeviceSignal(signalId)),
    setSignalField: (signalId: SignalId, key: keyof ISignalInstanceState, value: any) =>
      dispatch(setSelectedDeviceSignalField(signalId, key, value)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SignalsRunPanel);
