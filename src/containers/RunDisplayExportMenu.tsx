import {Button, Menu, MenuItem, Popover, PopoverInteractionKind, Position} from "@blueprintjs/core";
import * as React from "react";
import {WaveformEngineChart} from "../display/abstract-waveform-engine";
import {IApplicationState, ISignalInstanceState, ISignalState} from "../store/state";
import {connect} from "react-redux";
import {SparkDispatch} from "../store/actions";
import {exportAsCsv, exportAsPng} from "../store/actions/display-export-actions";
import {queryHasRunningDevices} from "../store/selectors";

interface IOwnProps {
  chart: WaveformEngineChart;
  signalsWithInstances: Array<[ISignalState, ISignalInstanceState]>;
}

interface IProps extends IOwnProps {
  running: boolean;

  exportAsPng(): void;
  exportAsCsv(): void;
}

const RunDisplayExportMenu = (props: IProps) => {
  const {running} = props;

  const chartMenu = (
    <Menu>
      <MenuItem text={tt("lbl_export_as_png")} onClick={props.exportAsPng}/>
      <MenuItem text={tt("lbl_export_as_csv")} onClick={props.exportAsCsv}/>
    </Menu>
  );

  return (
    <Popover content={chartMenu}
             disabled={running}
             minimal={true}
             interactionKind={PopoverInteractionKind.HOVER}
             position={Position.BOTTOM_RIGHT}>
      <Button icon="export"
              minimal={true}
              disabled={running}/>
    </Popover>
  );
};

const mapSTateToProps = (state: IApplicationState) => {
  return {
    running: queryHasRunningDevices(state),
  };
};

const mapDispatchToProps = (dispatch: SparkDispatch, ownProps: IOwnProps) => {
  return {
    exportAsPng: () => dispatch(exportAsPng(ownProps.chart)),
    exportAsCsv: () => dispatch(exportAsCsv(ownProps.signalsWithInstances)),
  }
};

export default connect(mapSTateToProps, mapDispatchToProps)(RunDisplayExportMenu);
