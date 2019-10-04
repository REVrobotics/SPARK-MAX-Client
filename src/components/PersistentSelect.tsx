import {Button, ButtonGroup, Menu, MenuDivider, MenuItem, Popover, PopoverPosition} from "@blueprintjs/core";
import {IItemRendererProps, Select} from "@blueprintjs/select";
import * as React from "react";
import {useCallback} from "react";
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
  modifiable?: boolean;

  getKey: (item: T) => string;
  getText: (item: T) => string;

  onRename(item: T): void;

  onSelect(item: T): void;

  onSave(item: T): void;

  onSaveAs(item: T): void;

  onRemove(item: T): void;
}

function PersistentSelect<T>(props: IProps<T>) {
  const {selected, modifiable, isDirty, getKey, getText, items, disabled, onRename, onSave, onSaveAs, onRemove, onSelect} = props;

  const canChange = coalesce(modifiable, true);

  const itemRenderer = useCallback(createItemRenderer(getKey, getText), [getKey, getText]);
  const rename = useCallback(() => onRename(selected), [selected]);
  const save = useCallback(() => onSave(selected), [selected]);
  const saveAs = useCallback(() => onSaveAs(selected), [selected]);
  const remove = useCallback(() => onRemove(selected), [selected]);

  return (
    <div className="flex-row">
      <Select className="select-form-field flex-1 mr-10"
              filterable={false}
              disabled={disabled}
              items={items}
              itemRenderer={itemRenderer}
              onItemSelect={onSelect}>
        <Button className={isDirty ? "modified" : ""}
                fill={true}
                disabled={disabled}
                text={selected ? getText(selected) : ""}
                rightIcon="double-caret-vertical"/>
      </Select>

      <ButtonGroup>
        {canChange ? (
            <>
              <Button className="persistent-select__main-btn" text="Save" onClick={save} disabled={disabled}/>
              <Popover minimal={true} position={PopoverPosition.BOTTOM_RIGHT}>
                <Button icon="chevron-down" disabled={disabled}/>
                <Menu className="persistent-select__menu">
                  <MenuItem text="Save As..." onClick={saveAs}/>
                  <MenuItem text="Rename..." onClick={rename}/>
                  <MenuDivider/>
                  <MenuItem text="Remove" onClick={remove}/>
                </Menu>
              </Popover>
            </>
          )
          : (
            <>
              <Button className="persistent-select__main-btn" text="Save As..." onClick={saveAs} disabled={disabled}/>
              <Button icon="chevron-down" disabled={true}/>
            </>
          )}
      </ButtonGroup>
    </div>
  );
}

export default PersistentSelect;
