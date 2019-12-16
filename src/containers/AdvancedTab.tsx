import classNames from "classnames";
import {constant, find, flatMap} from "lodash";
import * as React from "react";
import {ChangeEvent, ComponentType, KeyboardEvent, useCallback, useMemo, useRef, useState} from "react";
import {connect} from "react-redux";
import {IApplicationState, ProcessType} from "../store/state";
import {
  burnSelectedDeviceConfiguration,
  resetSelectedDeviceConfiguration,
  setSelectedDeviceAdvancedSearchString,
  SparkDispatch
} from "../store/actions";
import {
  Button, ButtonGroup,
  FormGroup,
  Icon,
  InputGroup,
  INumericInputProps, Menu, MenuItem,
  NonIdealState,
  Popover,
  PopoverPosition
} from "@blueprintjs/core";
import {
  queryHasDeviceDirtyParameterInGroup,
  queryHasDeviceParameterErrorInGroup,
  queryIsSelectedDeviceBlocked,
  queryIsSelectedDeviceEnabled,
  querySelectedDeviceProcessType,
  querySelectedDeviceSearchString,
  querySelectedVirtualDeviceId
} from "../store/selectors";
import {Column, ICellProps, Cell} from "@blueprintjs/table";
import {ISearchResultRecord, ISearchResultRecordItem, searchParams, WordType} from "../store/config-param-search";
import {
  ConfigParam,
  configParamVisibleGroups,
  getConfigParamGroupReadableName,
  getConfigParamName,
  getConfigParamReadableName,
  getConfigParamsInGroup
} from "../models/ConfigParam";
import {ConfigParamGroupName} from "../models/proto-gen/SPARK-MAX-Types_dto_pb";
import {setField} from "../utils/object-utils";
import bindRamConfigRule from "../hocs/bind-ram-config-rule";
import {IConfigParamProps} from "../components/config-param-props";
import FocusableCell from "../components/table/FocusableCell";
import Highlight from "../components/Highlight";
import TableContainer, {TableExt} from "../components/table/TableContainer";
import {useCallbackRef, useOnNext, useReplayPipe} from "../utils/react-utils";
import Focus from "../components/Focus";
import {getConfigParamRule} from "../store/config-param-rules";
import {ConfigParamRuleType} from "../store/param-rules/ConfigParamRule";
import SwitchParamField from "../components/fields/SwitchParamField";
import NumericParamField from "../components/fields/NumericParamField";
import EditableCell, {ENTER_START_KEY, ICellEditorOptions, NUMERIC_START_KEY} from "../components/table/EditableCell";
import {HTMLInputProps} from "@blueprintjs/core/src/common/props";
import {SafeNumericBehavior} from "../components/SafeNumericInput";
import PopoverHelp from "../components/PopoverHelp";
import {MessageSeverity} from "../models/Message";
import {ISelectProps} from "@blueprintjs/select";
import {getWordText, IDictionaryWord} from "../store/dictionaries";
import SelectParamField from "../components/fields/SelectParamField";

interface IProps {
  enabled: boolean;
  blocked: boolean;
  processType: ProcessType;
  search: string;

  onBurn(): void;

  onReset(): void;

  onResetAll(): void;

  onSearch(input: string): void;
}

interface IParameterTableProps {
  enabled: boolean;
  blocked: boolean;
  search: string;

  tableRef(ref: TableExt): void;

  onKeyOut(key: string): void;
}

interface IParameterGroupRowHeaderProps extends ICellProps {
  group: ConfigParamGroupName;
  opened: boolean;

  onChange(group: ConfigParamGroupName, opened: boolean): void;
}

interface IParameterCellProps extends ICellProps, IConfigParamProps {
  results?: { [type: string]: ISearchResultRecordItem };
}

interface IParameterGroupCellProps extends ICellProps {
  group: ConfigParamGroupName;
  groupOpened: boolean;
  hasDirty?: boolean;
  hasError?: boolean;

  onGroupOpened(group: ConfigParamGroupName, opened: boolean): void;
}

/**
 * Group row model
 */
interface IDisplayedGroupRow {
  grouped: true;
  group: ConfigParamGroupName;
}

/**
 * Parameter row model
 */
interface IDisplayedParamRow {
  grouped: false;
  param: ConfigParam;
  results?: { [type: string]: ISearchResultRecordItem };
}

type DisplayedRow = IDisplayedGroupRow | IDisplayedParamRow;

/**
 * Creates new component having group properties.
 */
const bindRamConfigGroup = (Component: ComponentType<IParameterGroupCellProps>): ComponentType<IParameterGroupCellProps> => {
  const mapStateToGroupProps = (state: IApplicationState, props: IParameterGroupCellProps) => {
    const selectedVirtualId = querySelectedVirtualDeviceId(state);

    return {
      hasDirty: selectedVirtualId ? queryHasDeviceDirtyParameterInGroup(state, selectedVirtualId, props.group) : false,
      hasError: selectedVirtualId ? queryHasDeviceParameterErrorInGroup(state, selectedVirtualId, props.group) : false,
    }
  };

  return connect(mapStateToGroupProps, constant({}))(Component);
};

const isDisplayedGroupRow = (row: DisplayedRow): row is IDisplayedGroupRow => row.grouped;

/**
 * If given key is *searchable*.
 * When table is focused and any *searchable* key is pressed, focus will move to the Search input
 * @param key
 */
const isSearchableKey = (key: string) => /^([a-zA-Z_]|Backspace|Escape)$/.test(key);

/**
 * Builds row models from the provided result.
 * Search result does not have groups.
 */
const buildDisplayedRowsFromSearchResult = (records: ISearchResultRecord[]): DisplayedRow[] =>
  records.map((record) => ({grouped: false, param: record.id, results: record.results}));

/**
 * Builds row models from the provided result.
 * Search result does not have groups.
 */
const buildDisplayedRowsWithGroups = (openedGroups: { [group: number]: boolean }): DisplayedRow[] =>
  flatMap(configParamVisibleGroups, (group) => {
    if (openedGroups[group]) {
      return [
        {grouped: true, group},
        ...getConfigParamsInGroup(group).map((param) => ({grouped: false, param}) as IDisplayedParamRow),
      ];
    } else {
      return [{grouped: true, group}];
    }
  });

/**
 * Builds row models for the provided input
 */
const buildDisplayedRows = (text: string, openedGroups: { [group: number]: boolean }) => {
  if (text) {
    return buildDisplayedRowsFromSearchResult(searchParams(text));
  } else {
    return buildDisplayedRowsWithGroups(openedGroups);
  }
};

/**
 * Component for header of group row
 */
const ParameterGroupRowHeaderCell = (props: IParameterGroupRowHeaderProps) => {
  // Toggle opened/closed state of group by click
  const doToggle = useCallback(
    () => props.onChange(props.group, !props.opened),
    [props.group, props.opened, props.onChange]);

  return (
    <Cell {...props} className="header-cell">
      <><Icon icon={props.opened ? "chevron-down" : "chevron-right"} onClick={doToggle}/></>
    </Cell>
  );
};

/**
 * Component for header of parameter row
 */
const ParameterRowHeaderCell = bindRamConfigRule((props: ICellProps & IConfigParamProps) => {
  const {isDirty, ...otherProps} = props;
  return (
    <Cell {...otherProps}
          className={classNames("header-cell", isDirty ? "cell--dirty" : undefined)}>
      <>{isDirty ? <Icon className="cell__dirty-icon" icon="asterisk" iconSize={8}/> : <span/>}</>
    </Cell>
  );
});

/**
 * Component for name cell of group row
 */
const ParameterGroupNameCell = bindRamConfigGroup((props: IParameterGroupCellProps) => {
  const {group, hasDirty, hasError, ...otherProps} = props;

  const onKeyDown = useCallback((event: KeyboardEvent<HTMLElement>) => {
    if (props.onKeyDown) {
      props.onKeyDown(event);
    }

    // Open/close group by Right/Left keys
    // Toggle opened/closed state of group by Enter key
    if (!props.groupOpened && event.key === "ArrowRight") {
      event.stopPropagation();
      props.onGroupOpened(group, true);
    } else if (props.groupOpened && event.key === "ArrowLeft") {
      event.stopPropagation();
      props.onGroupOpened(group, false);
    } else if (event.key === "Enter") {
      event.stopPropagation();
      props.onGroupOpened(group, !props.groupOpened);
    }
  }, [group, props.groupOpened, props.onGroupOpened, props.onKeyDown]);

  // Toggle opened/closed state of group by click
  const doToggle = useCallback(() => {
    props.onGroupOpened(group, !props.groupOpened);
  }, [group, props.group, props.onGroupOpened]);

  return (
    <FocusableCell {...otherProps}
                   onKeyDown={onKeyDown}
                   className="text-bold cell--clickable">
      <>
        <div className="flex-row text-underline-on-hover" onClick={doToggle}>
          {getConfigParamGroupReadableName(group)}
          {hasDirty ? " *" : null}
          {hasError ?
            <PopoverHelp enabled={false} content={tt("msg_group_has_error")} severity={MessageSeverity.Error}/>
            : null}
        </div>
      </>
    </FocusableCell>
  );
});

/**
 * Component for name cell of parameter row
 */
const ParameterNameCell = bindRamConfigRule((props: IParameterCellProps) => {
  const {parameter, results, isDirty, message, ...otherProps} = props;

  const readableName = getConfigParamReadableName(parameter);
  const code = getConfigParamName(parameter);

  // Display error/warning message for this parameter
  const noMessage = !message;
  const messageText = message && message.text || "";
  const severity = message ? message.severity : MessageSeverity.Warning;

  return (
    <FocusableCell {...otherProps} className={isDirty ? "cell--dirty" : undefined}>
      <>
        <div className="flex-row">
          {results && results[WordType.Text] ?
            <Highlight text={readableName} indices={results[WordType.Text].indices}/> : readableName}
          &nbsp;
          <i>
            ({results && results[WordType.Code] ?
            <Highlight text={code} indices={results[WordType.Code].indices}/> : code})
          </i>
          {noMessage ? null : <PopoverHelp enabled={noMessage} content={messageText} severity={severity}/>}
        </div>
      </>
    </FocusableCell>
  );
});

/**
 * Different viewers for different types of parameters
 */
const ParameterValue = (props: { value: number }) => <div>{props.value}</div>;
const NumericParameterValue = (props: IConfigParamProps) => <div className="text-right">{props.value}</div>;
const SelectParameterValue = (props: IConfigParamProps) => {
  const word = find(props.options, (option) => option.id === props.value);
  return (
    <div className="flex-row flex-space-between">
      {word ? getWordText(word) : <span/>}
      <Icon icon="double-caret-vertical"
            className={classNames("cell__open-btn", {"cell__open-btn--disabled": props.disabled})}/>
    </div>
  );
};

/**
 * Editor for numeric parameter
 */
const TableNumericParamEditor = (props: IConfigParamProps & { editorOptions: ICellEditorOptions }) => {
  const {editorOptions, value: originalValue, onValueChange, ...otherProps} = props;

  const [value, setValue] = useState(originalValue);
  const doValueChange = useCallback((param: ConfigParam, newValue: number) => setValue(newValue), []);

  const inputProps = useMemo<HTMLInputProps & INumericInputProps & { safeBehavior?: SafeNumericBehavior }>(() => ({
    safeBehavior: SafeNumericBehavior.NoClampAndNan,
    inputRef: editorOptions.setRef,
    onBlur: editorOptions.onBlur,
    onKeyDown: (event) => {
      // Cancel editing when user presses Escape
      if (event.key === "Escape") {
        event.stopPropagation();
        editorOptions.stopEditing(true);
      }
    },
  }), [editorOptions]);

  // Apply value when editing is finished, but not cancelled
  useOnNext(editorOptions.onStop, (cancelled) => {
    if (!cancelled) {
      onValueChange(otherProps.parameter, value);
    }
  }, [otherProps.parameter, value]);

  return (
    <NumericParamField {...otherProps}
                       value={value}
                       onValueChange={doValueChange}
                       inputProps={inputProps}/>
  );
};

/**
 * Editor for enum-based parameters
 * @param props
 * @constructor
 */
const TableSelectParamEditor = (props: IConfigParamProps & { editorOptions: ICellEditorOptions }) => {
  const {editorOptions, value, onValueChange, ...otherProps} = props;

  const selectProps = useMemo<Partial<ISelectProps<IDictionaryWord>>>(() => ({
    popoverProps: {
      autoFocus: true,
      // Always display backdrop to insure user from wrong action
      hasBackdrop: true,
      // Open Select by default
      isOpen: true,
      // Stop editing as soon as Select menu is closed
      onClose: () => editorOptions.stopEditing(false),
      openOnTargetFocus: true,
      canEscapeKeyClose: true,
    },
  }), [editorOptions]);

  return (
    <SelectParamField {...otherProps}
                      className="select-cell-editor"
                      value={value}
                      onValueChange={onValueChange}
                      selectProps={selectProps}/>
  );
};

/**
 * Editor for boolean parameter
 */
const BooleanEditableCell = (props: IParameterCellProps) => {
  const inputRef = useCallbackRef<HTMLInputElement>();
  const inputProps = useMemo(() => ({inputRef}), []);
  const onFocus = useCallback(() => inputRef.current.focus(), []);
  // Toggle parameter value on Enter
  const doKeyDown = useCallback((event: KeyboardEvent) => {
    if (!props.disabled && event.key === "Enter") {
      event.stopPropagation();
      props.onValueChange(props.parameter, props.value ? 0 : 1);
    }
  }, [props.disabled, props.parameter, props.value, props.onValueChange]);

  return (
    <FocusableCell {...props} autoFocus={false} onFocus={onFocus} onKeyDown={doKeyDown}>
      <SwitchParamField {...props} inputProps={inputProps}/>
    </FocusableCell>
  );
};

/**
 * Component for value cell of numeric parameter
 */
const NumericEditableCell = (props: IParameterCellProps) => {
  const {parameter, ...otherProps} = props;

  const editorFn = useCallback((options: ICellEditorOptions) =>
      <TableNumericParamEditor parameter={parameter}
                               {...otherProps}
                               editorOptions={options}/>,
    [otherProps.value]);

  return (
    <EditableCell {...otherProps} isStartKey={NUMERIC_START_KEY} editor={editorFn}>
      <NumericParameterValue {...props}/>
    </EditableCell>
  );
};

/**
 * Component for value cell of enum-based parameter
 */
const SelectEditableCell = (props: IParameterCellProps) => {
  const {parameter, ...otherProps} = props;

  const editorFn = useCallback((options: ICellEditorOptions) =>
      <TableSelectParamEditor parameter={parameter}
                               {...otherProps}
                               editorOptions={options}/>,
    [otherProps.value, otherProps.disabled]);

  return (
    <EditableCell {...otherProps} editor={editorFn} isStartKey={ENTER_START_KEY} editableBySingleClick={true}>
      <SelectParameterValue {...props}/>
    </EditableCell>
  );
};

/**
 * Component for value cell
 */
const ParameterEditableCell = bindRamConfigRule((props: IParameterCellProps) => {
  const {parameter, isDirty, ...otherProps} = props;

  const type = getConfigParamRule(parameter).type;

  const className = isDirty ? "cell--dirty" : undefined;

  switch (type) {
    case ConfigParamRuleType.Boolean:
      return <BooleanEditableCell {...props} className={classNames(className, "text-center")}/>;
    case ConfigParamRuleType.Numeric:
      return <NumericEditableCell {...props} className={className}/>;
    case ConfigParamRuleType.Enum:
      return <SelectEditableCell {...props} className={className}/>;
    default:
      return (
        <FocusableCell {...otherProps} className={className}>
          <ParameterValue value={otherProps.value}/>
        </FocusableCell>
      );
  }
});

const PARAMETER_TABLE_COLUMN_WIDTHS = [30, 420, 100];

/**
 * Root component for table
 */
const ParameterTable = (props: IParameterTableProps) => {
  const {enabled, blocked, search, onKeyOut} = props;

  const [openedGroups, setOpenedGroups] = useState<{ [group: number]: boolean }>({});

  const tableRef = useRef<TableExt>(null as any);
  const setTableRef = useCallback((ref) => {
    tableRef.current = ref;
    props.tableRef(ref);
  }, []);

  // Build set of rows for given search string
  const displayedRows = useMemo(() => buildDisplayedRows(search, openedGroups), [search, openedGroups]);
  const setGroupOpened = useCallback(
    (group: ConfigParamGroupName, opened: boolean) => setOpenedGroups(setField(openedGroups, group, opened)),
    [openedGroups]);

  const rowHeaderRenderer = useCallback(
    (rowIndex: number) => {
      const row = displayedRows[rowIndex];
      if (isDisplayedGroupRow(row)) {
        return <ParameterGroupRowHeaderCell group={row.group}
                                            opened={openedGroups[row.group]}
                                            onChange={setGroupOpened}/>;
      } else {
        return <ParameterRowHeaderCell parameter={row.param}/>;
      }
    },
    [displayedRows, openedGroups]);

  const nameCellRenderer = useCallback(
    (rowIndex: number, columnIndex: number) => {
      const row = displayedRows[rowIndex];
      if (isDisplayedGroupRow(row)) {
        return <ParameterGroupNameCell rowIndex={rowIndex}
                                       columnIndex={columnIndex}
                                       group={row.group}
                                       groupOpened={openedGroups[row.group]}
                                       onGroupOpened={setGroupOpened}/>
      } else {
        return <ParameterNameCell rowIndex={rowIndex}
                                  columnIndex={columnIndex}
                                  parameter={row.param}
                                  results={row.results}/>
      }
    },
    [displayedRows, openedGroups, enabled, blocked]);

  const valueCellRenderer = useCallback(
    (rowIndex: number, columnIndex: number) => {
      const row = displayedRows[rowIndex];

      if (isDisplayedGroupRow(row)) {
        return <FocusableCell rowIndex={rowIndex}
                              columnIndex={columnIndex}
        />;
      } else {
        return <ParameterEditableCell rowIndex={rowIndex}
                                      columnIndex={columnIndex}
                                      row={row}
                                      parameter={row.param}
                                      disabled={!(row.param === ConfigParam.kCanID ? enabled : enabled && !blocked)}/>
      }
    },
    [displayedRows, enabled, blocked]);

  const doKeyDown = useCallback((event: KeyboardEvent) => {
    const cell = tableRef.current.getFocusedCell();
    if (cell == null || tableRef.current.isEditing() || !isSearchableKey(event.key)) {
      return;
    }

    onKeyOut(event.key);
  }, [displayedRows]);

  if (displayedRows.length === 0) {
    return <NonIdealState icon="search" title={tt("lbl_search_no_results_title")}/>;
  }

  return (
    <TableContainer ref={setTableRef}
                    numRows={displayedRows.length}
                    columnWidths={PARAMETER_TABLE_COLUMN_WIDTHS}
                    className="parameter-table"
                    minRowHeight={25}
                    maxRowHeight={25}
                    defaultRowHeight={25}
                    enableMultipleSelection={false}
                    enableFocusedCell={true}
                    enableRowHeader={false}
                    onKeyDown={doKeyDown}>
      <Column id="header" name="" cellRenderer={rowHeaderRenderer}/>
      <Column id="name" name={tt("lbl_parameter_name")} cellRenderer={nameCellRenderer}/>
      <Column id="value" name={tt("lbl_value")} cellRenderer={valueCellRenderer}/>
    </TableContainer>
  );
};

const AdvancedTab = (props: IProps) => {
  const {processType, enabled, blocked, search, onBurn, onReset, onResetAll, onSearch} = props;

  const canSave = enabled && !blocked;

  const inputRef = useRef<HTMLInputElement>(null as any);
  const tableRef = useCallbackRef<TableExt>();
  const setInputRef = useCallback((inputEl) => {
    inputRef.current = inputEl;
    next(inputEl);
  }, []);
  const [pipe, next] = useReplayPipe<HTMLInputElement>();

  const doSearch = useCallback((event: ChangeEvent<HTMLInputElement>) => onSearch(event.target.value), []);
  const doClear = useCallback(() => {
    onSearch("");
    inputRef.current.focus();
  }, []);

  // When escape is pressed in the table => focus Search input
  const doFocusSearch = useCallback((key: string) => {
    inputRef.current.focus();
    if (key === "Escape") {
      inputRef.current.select();
    }
  }, []);

  // When Up/Down keys pressed in the search input => focus table
  const doSearchKeyDown = useCallback((event: KeyboardEvent) => {
    if (tableRef.current && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      tableRef.current.focus();
    }
  }, []);

  return (
    <div className="page flex-column">
      <FormGroup inline={true} className="form-group-full" label={tt("lbl_search")} labelFor="input">
        <Focus pipe={pipe}>
          <InputGroup id="input"
                      type="text"
                      inputRef={setInputRef}
                      value={search}
                      onChange={doSearch}
                      onKeyDown={doSearchKeyDown}
                      rightElement={
                        search ?
                          <Button icon="cross" minimal={true} title={tt("lbl_clear")} onClick={doClear}/>
                          : undefined
                      }/>
        </Focus>
      </FormGroup>
      <ParameterTable tableRef={tableRef}
                      enabled={enabled}
                      blocked={blocked}
                      search={search}
                      onKeyOut={doFocusSearch}/>
      <div className="form update-container">
        <Button className="rev-btn"
                disabled={!canSave || processType === ProcessType.Reset}
                loading={processType === ProcessType.Save}
                onClick={onBurn}>{tt("lbl_save_configuration")}</Button>
        <ButtonGroup>
          <Button className="bad-btn"
                  disabled={!enabled || processType === ProcessType.Save}
                  loading={processType === ProcessType.Reset}
                  onClick={onReset}>{tt("lbl_restore_factory_defaults")}</Button>
          <Popover position={PopoverPosition.TOP_RIGHT}
                   popoverClassName="attention-popover"
                   disabled={!enabled || !!processType}>
            <Button className="bad-btn"
                    icon="chevron-down"
                    disabled={!enabled || !!processType}/>
            <Menu>
              <MenuItem text={tt("lbl_reset_all")} onClick={onResetAll}/>
            </Menu>
          </Popover>
        </ButtonGroup>
      </div>
    </div>
  );
};

export function mapStateToProps(state: IApplicationState) {
  return {
    enabled: queryIsSelectedDeviceEnabled(state),
    blocked: queryIsSelectedDeviceBlocked(state),
    processType: querySelectedDeviceProcessType(state),
    search: querySelectedDeviceSearchString(state),
  };
}

export function mapDispatchToProps(dispatch: SparkDispatch) {
  return {
    onBurn: () => dispatch(burnSelectedDeviceConfiguration()),
    onReset: () => dispatch(resetSelectedDeviceConfiguration(false)),
    onResetAll: () => dispatch(resetSelectedDeviceConfiguration(true)),
    onSearch: (search: string) => dispatch(setSelectedDeviceAdvancedSearchString(search)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AdvancedTab);
