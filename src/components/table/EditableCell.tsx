import {keyBy} from "lodash";
import classNames from "classnames";
import {ICellProps} from "@blueprintjs/table";
import * as React from "react";
import {KeyboardEvent, ReactNode, useCallback, useContext, useMemo, useRef, useState} from "react";
import FocusableCell from "./FocusableCell";
import TableContext from "./TableContext";
import {Pipe, usePipe} from "../../utils/react-utils";

export const NUMERIC_START_KEY = (key: string) => /^[0-9]|Backspace|Enter$/.test(key);
export const ENTER_START_KEY = (key: string) => key === "Enter";

export interface ICellEditorRef {
  select?(): void;
  focus(): void;
}

/**
 * This object is passed into `editor`. Its properties can be used to control editing.
 */
export interface ICellEditorOptions {
  /**
   * Editor factory should pass an object having `focus` method to focus editor (for example, HTMLInputElement)
   */
  setRef(ref: ICellEditorRef | null): void;
  onBlur(): void;

  /**
   * This method can be called to stop editing
   */
  stopEditing(cancel: boolean): void;

  /**
   * This pipe receives a value right before editing is stopped.
   * `boolean` value is `true` when edit result should be cancelled, rather than applied.
   */
  onStop: Pipe<boolean>;
}

interface IProps extends ICellProps {
  /**
   * Whether editing can start by single or double click
   */
  editableBySingleClick?: boolean;
  disabled?: boolean;
  children: ReactNode;

  /**
   * Allows to configure key which will start editing in the cell
   */
  isStartKey?(key: string): boolean;

  /**
   * When edit mode is started, this function is called to build an editor
   */
  editor(props: ICellEditorOptions): ReactNode;
}

const GRID_KEYS = keyBy(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]);

const isGridKey = (key: string) => GRID_KEYS[key] != null;

/**
 * This component represents editable cell.
 */
const EditableCell = (props: IProps) => {
  const {editor, disabled, children, editableBySingleClick, isStartKey, ...otherProps} = props;

  const context = useContext(TableContext);
  const cellRef = useRef<FocusableCell>(null as any);
  const [editingMode, setEditingMode] = useState({editing: false, selectAll: false});
  const {editing, selectAll} = editingMode;
  const [stopPipe, stopNext] = usePipe<boolean>();
  const startEditing = useCallback((isSelectAll) => {
    if (disabled) {
      return;
    }

    setEditingMode({editing: true, selectAll: isSelectAll});
    context.setEditing(true);
  }, [editingMode, disabled]);
  const stopEditing = useCallback((cancel: boolean) => {
    if (context.isEditing()) {
      context.setEditing(false);
      setEditingMode({editing: false, selectAll: false});
      // As soon as editing is completed, move focus to the cell
      cellRef.current.focus();
      stopNext(cancel);
    }
  }, []);
  const editorOptions = useMemo<ICellEditorOptions>(
    () => {
      return {
        setRef: (el) => {
          if (el) {
            // As soon as element is available, we have to focus it
            el.focus();
            if (selectAll && el.select) {
              el.select();
            }
          }
        },
        onBlur: () => stopEditing(false),
        stopEditing,
        onStop: stopPipe,
      };
    },
    [stopEditing, editingMode]);

  const doKeyDown = useCallback((event: KeyboardEvent) => {
    if (isGridKey(event.key)) {
      return;
    }

    if (event.key === "Enter") {
      // Enter key starts or stops editing
      event.stopPropagation();
      if (editing) {
        stopEditing(false);
      } else {
        startEditing(true);
      }
    } else if (!editing && (!isStartKey || isStartKey(event.key))) {
      // Start editing when user press any key
      startEditing(true);
    }
  }, [editing, startEditing, stopEditing]);
  const doStartEditing = useCallback(() => startEditing(false), [startEditing]);

  return (
    <FocusableCell {...otherProps}
                   ref={cellRef}
                   className={classNames(otherProps.className, "editable-cell", {
                     "editable-cell--editing": editing,
                     "editable-cell--editable": !editing && !disabled,
                     "cell--clickable": !disabled && editableBySingleClick,
                   })}
                   onKeyDown={doKeyDown}>
      {editing ?
        editor(editorOptions)
        : (
          // Fragment is necessary here to avoid the following problem
          // https://github.com/palantir/blueprint/issues/2446
          <><div className="editable-cell__value"
                 onClick={editableBySingleClick ? doStartEditing : undefined}
                 onDoubleClick={editableBySingleClick ? undefined : doStartEditing}>{children}</div></>
        )}
    </FocusableCell>
  );
};

// Actually this component does nothing and necessary to avoid problem

// const EditableCellContent = (props: {children?: ReactNode}) => <>{props.children}</>;

export default EditableCell;
