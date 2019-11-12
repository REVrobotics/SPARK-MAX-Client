import {constant, groupBy, identity, keys, without} from "lodash";
import {Button, ButtonGroup, Menu, MenuItem, Popover, PopoverPosition} from "@blueprintjs/core";
import {IItemRendererProps, ItemListRenderer, Select} from "@blueprintjs/select";
import classNames from "classnames";
import * as React from "react";
import {ReactNode, useCallback, useMemo} from "react";
import {coalesce} from "../utils/object-utils";
import {IItemListRendererProps} from "@blueprintjs/select/src/common/itemListRenderer";

interface IProps<T> {
  selected: T;
  items: T[];
  /**
   * If `groupBy` is defined, items are displayed in groups
   */
  groupBy?: (item: T) => string;
  /**
   * `groupTitle` allows to define translation for each item group
   */
  groupTitle?: (key: string) => string;
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

const createItemListRenderer = (by: (item: any) => string = constant(""),
                                groupTitle: (key: string) => string = identity): ItemListRenderer<any> => {
  const ItemList = (props: IItemListRendererProps<any>) => {
    const [groups, itemsByGroup] = useMemo(() => {
      const grouped = groupBy(props.items, by);
      return [without(keys(grouped), ""), grouped];
    }, [props.items, by, groupTitle]);

    const defaultItems = itemsByGroup[""];
    let index = 0;
    return (
      <Menu ulRef={props.itemsParentRef}>
        {defaultItems.map((item) => props.renderItem(item, index++))}
        {groups.map((group) => (
          <React.Fragment key={group}>
            <li className="bp3-menu-header"><h6 className="bp3-heading">{groupTitle(group)}</h6></li>
            {itemsByGroup[group].map((item) => props.renderItem(item, index++))}
          </React.Fragment>
        ))}
      </Menu>
    );
  };

  return (props) => <ItemList {...props}/>;
};

/**
 * Dropdown of persisted values. Selected value has set of actions.
 */
function PersistentSelect<T>(props: IProps<T>) {
  const {
    selected, appliable, modifiable, isDirty, getKey, getText, items, disabled,
    groupBy: by, groupTitle,
    onRename, onOverwrite, onCreate, onRemove, onApply, onSelect,
  } = props;

  const canApply = coalesce(appliable, true);
  const canModify = coalesce(modifiable, true);

  const itemRenderer = useCallback(createItemRenderer(getKey, getText), [getKey, getText]);
  const itemListRenderer = useCallback(createItemListRenderer(by, groupTitle), [by, groupTitle]);
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
                         text={tt("lbl_apply")}
                         onClick={apply}
                         disabled={disabled || !isDirty}/>;
  } else if (canModify) {
    // If "apply" action is not available and value is modifiable then default action is "overwrite"
    mainAction = <Button className="persistent-select__main-btn" text={tt("lbl_overwrite")} onClick={overwrite} disabled={disabled}/>;
  } else {
    // If value is neither appliable nor modifiable, then default action is "create"
    mainAction = <Button className="persistent-select__main-btn" text={tt("lbl_create_dots")} onClick={create} disabled={disabled}/>;
  }

  // Construction available menu actions for selected value
  if (canApply && canModify) {
    menuActions = (
      <Popover minimal={true} position={PopoverPosition.BOTTOM_RIGHT}>
        <Button icon="chevron-down" disabled={disabled}/>
        <Menu className="persistent-select__menu">
          <MenuItem text={tt("lbl_overwrite")} onClick={overwrite}/>
          <MenuItem text={tt("lbl_create_dots")} onClick={create}/>
          <MenuItem text={tt("lbl_rename_dots")} onClick={rename}/>
          <MenuItem text={tt("lbl_remove")} onClick={remove}/>
        </Menu>
      </Popover>
    );
  } else if (canApply && !canModify) {
    menuActions = (
      <Popover minimal={true} position={PopoverPosition.BOTTOM_RIGHT}>
        <Button icon="chevron-down" disabled={disabled}/>
        <Menu className="persistent-select__menu">
          <MenuItem text={tt("lbl_create_dots")} onClick={create}/>
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
              itemListRenderer={itemListRenderer}
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
