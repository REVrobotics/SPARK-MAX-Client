import {Button, ButtonGroup, Menu, MenuItem, Popover, PopoverPosition} from "@blueprintjs/core";
import {IItemRendererProps, Select} from "@blueprintjs/select";
import classNames from "classnames";
import * as React from "react";
import {ReactNode, useCallback} from "react";
import {coalesce} from "../utils/object-utils";

const createItemRenderer = (getKey: (item: any) => string, getText: (item: any) => string) => {
  return (item: any, itemProps: IItemRendererProps) => (
    <MenuItem
      active={itemProps.modifiers.active}
      key={getKey(item)}
      onClick={itemProps.handleClick}
      text={getText(item)}
    />
  );
};

interface IProps<T> {
  selected: T;
  items: T[];
  disabled?: boolean;
  /**
   * If `isDirty` flag is set, then asterisk (`*`) is displayed on the right of a label in select.
   */
  isDirty?: boolean;
  /**
   * If `appliable` flag is set, then selected action has *apply* action.
   */
  appliable?: boolean;
  /**
   * If `modifiable` flag is set, then selected action has *Overwrite*, *Rename* and *Remove* actions.
   */
  modifiable?: boolean;

  /**
   * Returns unique id for given item
   */
  getKey: (item: T) => string;
  /**
   * Returns text for given item
   */
  getText: (item: T) => string;

  /**
   * Runs when user selects *rename* action.
   * @param item
   */
  onRename(item: T): void;

  /**
   * Fires when user selects value in dropdown
   */
  onSelect(item: T): void;

  /**
   * Runs when user selects *overwrite* action
   */
  onOverwrite(item: T): void;

  /**
   * Runs when user selects *create* action.
   */
  onCreate(item: T): void;

  /**
   * Runs when user selects *remove* action.
   */
  onRemove(item: T): void;

  /**
   * Runs when user selects *apply* action.
   */
  onApply(item: T): void;
}

/**
 * Dropdown of persisted values. Selected value has set of actions.
 */
function PersistentSelect<T>(props: IProps<T>) {
  const {
    selected, appliable, modifiable, isDirty, getKey, getText, items, disabled,
    onRename, onOverwrite, onCreate, onRemove, onApply, onSelect,
  } = props;

  const canApply = coalesce(appliable, true);
  const canModify = coalesce(modifiable, true);

  const itemRenderer = useCallback(createItemRenderer(getKey, getText), [getKey, getText]);
  const rename = useCallback(() => onRename(selected), [selected]);
  const overwrite = useCallback(() => onOverwrite(selected), [selected]);
  const create = useCallback(() => onCreate(selected), [selected]);
  const remove = useCallback(() => onRemove(selected), [selected]);
  const apply = useCallback(() => onApply(selected), [selected]);

  let mainAction: ReactNode;
  let menuActions: ReactNode;

  // If "apply" action is available it is always a default action
  if (canApply) {
    mainAction = <Button className="persistent-select__main-btn"
                         text="Apply"
                         onClick={apply}
                         disabled={disabled || !isDirty}/>;
  } else if (canModify) {
    // If "apply" action is not available and value is modifiable then default action is "overwrite"
    mainAction = <Button className="persistent-select__main-btn" text="Overwrite" onClick={overwrite} disabled={disabled}/>;
  } else {
    // If value is neither appliable nor modifiable, then default action is "create"
    mainAction = <Button className="persistent-select__main-btn" text="Create..." onClick={create} disabled={disabled}/>;
  }

  // Construction available menu actions for selected value
  if (canApply && canModify) {
    menuActions = (
      <Popover minimal={true} position={PopoverPosition.BOTTOM_RIGHT}>
        <Button icon="chevron-down" disabled={disabled}/>
        <Menu className="persistent-select__menu">
          <MenuItem text="Overwrite" onClick={overwrite}/>
          <MenuItem text="Create..." onClick={create}/>
          <MenuItem text="Rename..." onClick={rename}/>
          <MenuItem text="Remove" onClick={remove}/>
        </Menu>
      </Popover>
    );
  } else if (canApply && !canModify) {
    menuActions = (
      <Popover minimal={true} position={PopoverPosition.BOTTOM_RIGHT}>
        <Button icon="chevron-down" disabled={disabled}/>
        <Menu className="persistent-select__menu">
          <MenuItem text="Create..." onClick={create}/>
        </Menu>
      </Popover>
    );
  } else {
    menuActions = <Button icon="chevron-down" disabled={true}/>;
  }

  return (
    <div className="flex-row">
      <Select className="select-form-field flex-1 mr-10"
              filterable={false}
              disabled={disabled}
              items={items}
              itemRenderer={itemRenderer}
              onItemSelect={onSelect}>
        <Button className={classNames("no-wrap", {"modified": isDirty})}
                fill={true}
                disabled={disabled}
                text={selected ? getText(selected) : ""}
                rightIcon="double-caret-vertical"/>
      </Select>

      <ButtonGroup>
        {mainAction}
        {menuActions}
      </ButtonGroup>
    </div>
  );
}

export default PersistentSelect;
