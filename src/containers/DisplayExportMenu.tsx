import {
  Button,
  Checkbox,
  Classes,
  Dialog,
  Divider,
  FormGroup,
  Menu,
  MenuItem,
  Popover,
  PopoverInteractionKind,
  Position
} from "@blueprintjs/core";
import * as React from "react";
import {ReactNode, useCallback} from "react";
import {WaveformEngineChart} from "../display/abstract-waveform-engine";
import {
  IApplicationState,
  IDisplayCsvExportSettings,
  IDisplayExportSettings,
  ISignalInstanceState,
  ISignalState
} from "../store/state";
import {connect} from "react-redux";
import {setCsvExportDialogOpened, setCsvExportSetting, SparkDispatch} from "../store/actions";
import {exportAsCsv, exportAsPng} from "../store/actions/display-export-actions";
import {queryDisplayExportSettings, queryHasRunningDevices} from "../store/selectors";
import SafeNumericInput, {SafeNumericBehavior} from "../components/SafeNumericInput";

interface IOwnProps {
  chart: WaveformEngineChart;
  signalsWithInstances: Array<[ISignalState, ISignalInstanceState]>;
}

interface IProps extends IOwnProps {
  running: boolean;
  settings: IDisplayExportSettings;

  setCsvExportDialogOpened(isOpened: boolean): void;
  setCsvExportSetting(key: keyof IDisplayCsvExportSettings, value: any): void;
  exportAsPng(): void;
  exportAsCsv(): void;
}

const DisplayExportMenu = (props: IProps) => {
  const {
    running, settings: {isCsvExportInProcess, csv: {timeInterval, includeTimeColumn, excludeGaps}},
    setCsvExportDialogOpened: setCsvDialogOpened, setCsvExportSetting : setCsvSetting,
    exportAsCsv: doExportAsCsv, exportAsPng: doExportAsPng,
  } = props;

  const doOpenCsvExportDialog = useCallback(() => setCsvDialogOpened(true), []);
  const doCloseCsvExportDialog = useCallback(() => setCsvDialogOpened(false), []);
  const doSetTimeInterval = useCallback((value) => setCsvSetting("timeInterval", value), []);
  const doChangeIncludeTimeColumn = useCallback(
    () => setCsvSetting("includeTimeColumn", !includeTimeColumn),
    [includeTimeColumn]);
  const doChangeExcludeGaps = useCallback(
    () => setCsvSetting("excludeGaps", !excludeGaps),
    [excludeGaps]);

  const chartMenu = (
    <Menu>
      <MenuItem text={tt("lbl_export_as_png")} onClick={doExportAsPng}/>
      <MenuItem text={tt("lbl_export_as_csv")} onClick={doOpenCsvExportDialog}/>
    </Menu>
  );

  let csvExportDialog: ReactNode | undefined;
  if (isCsvExportInProcess) {
    csvExportDialog = (
      <Dialog title={tt("lbl_csv_export")}
              className="csv-export-dialog"
              isOpen={isCsvExportInProcess}
              onClose={doCloseCsvExportDialog}>
        <div className={Classes.DIALOG_BODY}>
          <FormGroup inline={true} label={tt("lbl_time_interval")}>
            <SafeNumericInput
              min={1}
              max={100000}
              stepSize={100}
              majorStepSize={100}
              value={timeInterval}
              safeInvalidValue={1000}
              safeBehavior={SafeNumericBehavior.ClampAndNoNan}
              onValueChange={doSetTimeInterval}/>
          </FormGroup>
          <div className="form">
            <Checkbox label={tt("lbl_include_time_column")}
                      className="mr-10"
                      checked={includeTimeColumn}
                      onChange={doChangeIncludeTimeColumn}/>
            <Checkbox label={tt("lbl_exclude_gaps")}
                      checked={excludeGaps}
                      onChange={doChangeExcludeGaps}/>
          </div>
          <Divider/>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button className="rev-btn"
                    type="submit"
                    text={tt("lbl_export")}
                    onClick={doExportAsCsv}/>
            <Button minimal={true}
                    text={tt("lbl_cancel")}
                    onClick={doCloseCsvExportDialog}/>
          </div>
        </div>
      </Dialog>
    );
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
    setCsvExportSetting: (key: keyof IDisplayCsvExportSettings, value: any) =>
      dispatch(setCsvExportSetting(key, value)),
    exportAsPng: () => dispatch(exportAsPng(ownProps.chart)),
    exportAsCsv: () => dispatch(exportAsCsv(ownProps.signalsWithInstances)),
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(DisplayExportMenu);
