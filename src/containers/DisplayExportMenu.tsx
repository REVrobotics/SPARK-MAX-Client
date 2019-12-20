import {Button, Menu, MenuItem, Popover, PopoverInteractionKind, Position} from "@blueprintjs/core";
import * as React from "react";
import {ReactNode, useCallback} from "react";
import {WaveformEngineChart} from "../display/abstract-waveform-engine";
import {IApplicationState, IDisplayExportSettings, ISignalInstanceState, ISignalState} from "../store/state";
import {connect} from "react-redux";
import {setCsvExportDialogOpened, SparkDispatch} from "../store/actions";
import {exportAsPng} from "../store/actions/display-export-actions";
import {queryDisplayExportSettings, queryHasRunningDevices} from "../store/selectors";
import CsvExportDialog from "./CsvExportDialog";

interface IOwnProps {
  chart: WaveformEngineChart;
  signalsWithInstances: Array<[ISignalState, ISignalInstanceState]>;
}

interface IProps extends IOwnProps {
  running: boolean;
  settings: IDisplayExportSettings;

  setCsvExportDialogOpened(isOpened: boolean): void;
  exportAsPng(): void;
}

const DisplayExportMenu = (props: IProps) => {
  const {
    signalsWithInstances,
    running, settings: {isCsvExportInProcess},
    setCsvExportDialogOpened: setCsvDialogOpened,
    exportAsPng: doExportAsPng,
  } = props;

  const doOpenCsvExportDialog = useCallback(() => setCsvDialogOpened(true), []);

  const chartMenu = (
    <Menu>
      <MenuItem text={tt("lbl_export_as_png")} onClick={doExportAsPng}/>
      <MenuItem text={tt("lbl_export_as_csv")} onClick={doOpenCsvExportDialog}/>
    </Menu>
  );

  let csvExportDialog: ReactNode | undefined;
  if (isCsvExportInProcess) {
    csvExportDialog = <CsvExportDialog signalsWithInstances={signalsWithInstances}/>;
  }

  return (
    <>
      {csvExportDialog}
      <Popover content={chartMenu}
               disabled={running}
               minimal={true}
               interactionKind={PopoverInteractionKind.HOVER}
               position={Position.BOTTOM_RIGHT}>
        <Button icon="export"
                minimal={true}
                disabled={running}/>
      </Popover>
    </>
  );
};

const mapStateToProps = (state: IApplicationState) => {
  return {
    running: queryHasRunningDevices(state),
    settings: queryDisplayExportSettings(state),
  };
};

const mapDispatchToProps = (dispatch: SparkDispatch, ownProps: IOwnProps) => {
  return {
    setCsvExportDialogOpened: (isOpened: boolean) => dispatch(setCsvExportDialogOpened(isOpened)),
    exportAsPng: () => dispatch(exportAsPng(ownProps.chart)),
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(DisplayExportMenu);
