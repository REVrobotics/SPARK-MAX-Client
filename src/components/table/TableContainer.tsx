import classNames from "classnames";
import {create} from "lodash";
import {ITableProps, Table} from "@blueprintjs/table";
import * as React from "react";
import {Ref, KeyboardEvent, useCallback, useImperativeHandle, useMemo, useRef, useEffect, useState} from "react";
import TableContext, {createTableContext} from "./TableContext";
import {IFocusedCellCoordinates} from "@blueprintjs/table/src/common/cell";

export interface TableExt extends Table {
  isFocusable(): boolean;
  focus(): void;
  getFocusedCell(): IFocusedCellCoordinates | undefined;
  isEditing(): boolean;
}

interface IProps extends ITableProps {
  onKeyDown?(event: KeyboardEvent): void;
}

/**
 * Wrapper around blueprint `Table` component.
 * It enhances support of focusing and editing in the grid
 */
const TableContainer = React.forwardRef((props: IProps, ref: Ref<TableExt>) => {
  const {className, onKeyDown, ...tableProps} = props;

  const context = useMemo(createTableContext, []);
  const tableRef = useRef<any>();
  // Extend table API
  useImperativeHandle<Table, TableExt>(ref, () => create(tableRef.current, {
    focus: context.focus,
    isFocusable: context.isFocused,
    getFocusedCell: context.getFocusedCell,
    isEditing: context.isEditing,
  }));
  const setRootRef = useCallback((rootEl) => context.setRoot(rootEl), []);

  const doCompleteRender = useCallback(() => {
    context.completeRender();
    if (props.onCompleteRender) {
      props.onCompleteRender();
    }
  }, [props.onCompleteRender]);

  const doFocusedCell = useCallback((coord: IFocusedCellCoordinates) => {
    context.setFocusedCell(coord);

    if (props.onFocusedCell) {
      props.onFocusedCell(coord);
    }
  }, [props.onFocusedCell]);

  const [editing, setEditing] = useState(false);

  useEffect(() => {
    context.onStateChange(() => {
      setEditing(context.isEditing());
    });
  }, []);

  return (
    <TableContext.Provider value={context}>
      <div className={classNames("table-container", className, {
        "table-container--editing": editing,
      })}
           onKeyDown={onKeyDown}
           ref={setRootRef}>
        <Table {...tableProps}
               ref={tableRef}
               onFocusedCell={doFocusedCell}
               onCompleteRender={doCompleteRender}>
          {props.children}
        </Table>
      </div>
    </TableContext.Provider>
  )
});

export default TableContainer;
