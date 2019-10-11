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
  isDirty?: boolean;
  appliable?: boolean;
  modifiable?: boolean;

  getKey: (item: T) => string;
  getText: (item: T) => string;

  onRename(item: T): void;

  onSelect(item: T): void;

  onSave(item: T): void;

  onSaveAs(item: T): void;

  onRemove(item: T): void;

  onApply(item: T): void;
}

function PersistentSelect<T>(props: IProps<T>) {
  const {
    selected, appliable, modifiable, isDirty, getKey, getText, items, disabled,
    onRename, onSave, onSaveAs, onRemove, onApply, onSelect,
  } = props;

  const canApply = coalesce(appliable, true);
  const canModify = coalesce(modifiable, true);

  const itemRenderer = useCallback(createItemRenderer(getKey, getText), [getKey, getText]);
  const rename = useCallback(() => onRename(selected), [selected]);
  const save = useCallback(() => onSave(selected), [selected]);
  const saveAs = useCallback(() => onSaveAs(selected), [selected]);
  const remove = useCallback(() => onRemove(selected), [selected]);
  const apply = useCallback(() => onApply(selected), [selected]);

  let mainAction: ReactNode;
  let menuActions: ReactNode;

  if (canApply) {
    mainAction = <Button className="persistent-select__main-btn"
                         text="Apply"
                         onClick={apply}
                         disabled={disabled || !isDirty}/>;
  } else if (canModify) {
    mainAction = <Button className="persistent-select__main-btn" text="Save" onClick={save} disabled={disabled}/>;
  } else {
    mainAction = <Button className="persistent-select__main-btn" text="Save As..." onClick={saveAs} disabled={disabled}/>;
  }

  if (canApply && canModify) {
    menuActions = (
      <Popover minimal={true} position={PopoverPosition.BOTTOM_RIGHT}>
        <Button icon="chevron-down" disabled={disabled}/>
        <Menu className="persistent-select__menu">
          <MenuItem text="Save" onClick={save}/>
          <MenuItem text="Save As..." onClick={saveAs}/>
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
          <MenuItem text="Save As..." onClick={saveAs}/>
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
