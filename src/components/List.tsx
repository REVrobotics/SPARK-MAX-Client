import classNames from "classnames";
import * as React from "react";
import {ReactElement, useCallback} from "react";

/**
 * Children of `List` should satisfy this interface
 */
interface ListItemProps {
  value: any;
  active?: boolean;

  onClick?(): void;
}

interface Props {
  className?: string;
  selected: any;
  /**
   * Children of `List` should satisfy `ListItemProps` interface
   */
  children: Array<ReactElement<ListItemProps>>;

  onSelect(value: any): void;
}

interface ItemWithSelectionProps {
  base: ReactElement<ListItemProps>;
  active: boolean;

  onClick(item: any): void;
}

const ItemWithSelection = (props: ItemWithSelectionProps) => {
  const {value} = props.base.props;
  const click = useCallback(() => props.onClick(value), [value]);
  return React.cloneElement(props.base, {...props.base.props, active: props.active, onClick: click});
};

/**
 * This component declares component for list of selectable items.
 */
const List = (props: Props) => {
  const {selected, onSelect} = props;

  const className = classNames("list", props.className);

  return (
    <div className={className}>
      {React.Children.map(props.children, (child) => <ItemWithSelection base={child}
                                                                        active={selected === child.props.value}
                                                                        onClick={onSelect}/>)}
      <div className="list__gap"/>
    </div>
  )
};

export default List;
