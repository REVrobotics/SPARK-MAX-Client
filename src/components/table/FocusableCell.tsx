import {Cell, ICellProps} from "@blueprintjs/table";
import * as React from "react";
import TableContext, {ITableCell} from "./TableContext";

interface IProps extends ICellProps {
  isFocused?: boolean;
  autoFocus?: boolean;
  onFocus?(): void;
}

/**
 * This component represents focusable cell
 */
class FocusableCell extends React.Component<IProps> implements ITableCell {
  public static defaultProps = {autoFocus: true};

  public static contextType = TableContext;
  public context!: React.ContextType<typeof TableContext>;

  private cellRef: HTMLElement;
  private refHandlers = {
    cell: (ref: HTMLElement) => {
      this.cellRef = ref;
      this.propagateCellRef();
    },
  };
  private lastRowIndex?: number;
  private lastColumnIndex?: number;

  public componentDidMount() {
    this.propagateCellRef();
  }

  public componentWillUnmount(): void {
    this.removeCellRef();
  }

  public componentDidUpdate(): void {
    this.propagateCellRef();
  }

  public focus(): void {
    if (this.props.autoFocus) {
      this.cellRef.focus();
    } else if (this.props.onFocus) {
      this.props.onFocus();
    }
  }

  public render() {
    return (
      <Cell
        {...this.props}
        tabIndex={0}
        interactive={this.props.interactive}
        cellRef={this.refHandlers.cell}
      />
    );
  }

  private propagateCellRef(): void {
    const {rowIndex, columnIndex} = this.props;
    if (this.lastRowIndex === rowIndex && this.lastColumnIndex === columnIndex) {
      return;
    }

    this.removeCellRef();

    if (rowIndex != null && columnIndex != null && this.cellRef) {
      this.context.setCell(rowIndex, columnIndex, this);
      this.lastRowIndex = rowIndex;
      this.lastColumnIndex = columnIndex;
    }
  }

  private removeCellRef(): void {
    if (this.lastRowIndex != null && this.lastColumnIndex != null) {
      this.context.removeCell(this.lastRowIndex, this.lastColumnIndex);
      this.lastRowIndex = undefined;
      this.lastColumnIndex = undefined;
    }
  }
}

export default FocusableCell;
