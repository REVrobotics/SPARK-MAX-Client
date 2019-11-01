import {get, isEmpty, once, pull} from "lodash";
import * as React from "react";
import {isElementDescendantOf} from "../../utils/dom-utils";
import {IFocusedCellCoordinates} from "@blueprintjs/table/lib/cjs/common/cell";

export interface ITableCell {
  focus(): void;
}

/**
 * Shared table state
 */
export interface ITableContext {
  /**
   * Sets table root element
   */
  setRoot(element: HTMLElement): void;

  /**
   * Sets focused cell
   */
  setFocusedCell(coord: IFocusedCellCoordinates): void;

  /**
   * Is table placed inside a table
   */
  isFocused(): boolean;

  /**
   * Returns coordinates of focused cell
   */
  getFocusedCell(): IFocusedCellCoordinates | undefined;

  /**
   * Focuses table. If some cell is focused, this method moves focus to this cell
   */
  focus(): void;

  /**
   * Make some processing as soon as table is rendered
   */
  completeRender(): void;

  /**
   * Is table in edit mode
   */
  isEditing(): boolean;

  /**
   * Sets edit mode
   */
  setEditing(editing: boolean): void;

  /**
   * Adds rendered cell
   */
  setCell(rowIndex: number, columnIndex: number, cell: ITableCell): void;

  /**
   * Removes cell
   */
  removeCell(rowIndex: number, columnIndex: number): void;

  /**
   * Registers callback to be called as soon as *some* table state is changed
   */
  onStateChange(cb: () => void): void;
}

export const createTableContext = (): ITableContext => {
  const rows: {[rowIndex: number]: {[columnIndex: number]: ITableCell}} = {};
  let focusedCell: IFocusedCellCoordinates | undefined;
  let focusScheduled = false;
  let editing = false;
  let rootEl: HTMLElement;
  const stateSubscriptions: Array<() => void> = [];

  const isFocused = () => {
    return document.activeElement && rootEl ?
      isElementDescendantOf(document.activeElement as HTMLElement, rootEl)
      : false;
  };

  const focus = () => {
    if (focusedCell) {
      // If some cell is focused, move focus to this cell
      const cell = getCell(focusedCell.row, focusedCell.col);
      if (cell) {
        cell.focus();
      }
    } else {
      // If cell is not focus, run default behavior
      const tableEl = rootEl.querySelector<HTMLElement>(".bp3-table-container");
      if (tableEl) {
        tableEl.focus();
      }
    }
  };

  const notifyStateChanged = () => {
    stateSubscriptions.forEach((cb) => cb());
  };

  const getCell = (rowIndex: number, columnIndex: number): ITableCell | undefined =>
    get(rows, [rowIndex, columnIndex]);

  return {
    setRoot: (el) => {
      rootEl = el;
    },
    isFocused,
    getFocusedCell: () => focusedCell,
    focus,
    completeRender: () => {
      if (focusScheduled && isFocused()) {
        focusScheduled = false;
        focus();
      }
    },
    isEditing: () => editing,
    setEditing: (flag) => {
      editing = flag;

      notifyStateChanged();
    },
    setFocusedCell: (coord) => {
      if (focusedCell && focusedCell.row === coord.row && focusedCell.col === coord.col) {
        return;
      }
      focusedCell = coord;
      focusScheduled = true;
    },
    setCell: (rowIndex, columnIndex, cell) => {
      const row = rows[rowIndex] = rows[rowIndex] || {};
      row[columnIndex] = cell;
    },
    removeCell: (rowIndex, columnIndex) => {
      const rowRefs = rows[rowIndex];
      if (rowRefs) {
        delete rowRefs[columnIndex];
        if (isEmpty(rowRefs)) {
          delete rows[rowIndex];
        }
      }
      if (focusedCell && focusedCell.row === rowIndex && focusedCell.col === columnIndex) {
        focusedCell = undefined;
      }
    },
    onStateChange: (cb: () => void) => {
      stateSubscriptions.push(cb);

      return once(() => {
        pull(stateSubscriptions, cb);
      });
    },
  };
};

const TableContext = React.createContext<ITableContext>(undefined as any);

export default TableContext;
