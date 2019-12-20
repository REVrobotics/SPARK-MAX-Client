import {fromPairs} from "lodash";
import {
  Button,
  Checkbox,
  Classes,
  Dialog,
  Divider,
  Menu,
  MenuItem,
  Popover,
  PopoverInteractionKind,
  Position
} from "@blueprintjs/core";
import * as React from "react";
import {ReactNode, useCallback, useState} from "react";
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
  exportAsCsv(signalWithInstances: Array<[ISignalState, ISignalInstanceState]>): void;
}

interface IExportedSignalProps {
  id: string;
  checked: boolean;
  color: string;
  label: string;
  onChange(id: string, checked: boolean): void;
}

const ExportedSignal = (props: IExportedSignalProps) => {
  const {id, checked, onChange, color, label} = props;

  const doChange = useCallback(() => onChange(id, !checked), [id, checked, onChange]);

  return (
    <Checkbox key={id}
              checked={checked}
              onChange={doChange}>
      <span><div className="csv__signal-sample" style={{background: color}}/>{label}</span>
    </Checkbox>
  );
};

const DisplayExportMenu = (props: IProps) => {
  const {
    signalsWithInstances,
    running, settings: {isCsvExportInProcess, csv: {includeTimeColumn}},
    setCsvExportDialogOpened: setCsvDialogOpened, setCsvExportSetting : setCsvSetting,
    exportAsPng: doExportAsPng,
  } = props;

  const [exportedSignal, setExportedSignal] = useState(() =>
    fromPairs(signalsWithInstances.map(([_, instance]) => [instance.scaleId, true])));

  const doExportedSignalChange = useCallback((id: string, isExported: boolean) => setExportedSignal({
    ...exportedSignal,
    [id]: isExported,
  }), [exportedSignal]);

  const doOpenCsvExportDialog = useCallback(() => setCsvDialogOpened(true), []);
  const doCloseCsvExportDialog = useCallback(() => setCsvDialogOpened(false), []);
  const doChangeIncludeTimeColumn = useCallback(
    () => setCsvSetting("includeTimeColumn", !includeTimeColumn),
    [includeTimeColumn]);

  const doExportAsCsv = useCallback(
    () => props.exportAsCsv(signalsWithInstances.filter(([_, instance]) => exportedSignal[instance.scaleId])),
    [exportedSignal]);

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
              style={{width: "300px"}}
              isOpen={isCsvExportInProcess}
              onClose={doCloseCsvExportDialog}>
        <div className={Classes.DIALOG_BODY}>
          <div className="form-column">
            <Checkbox label={tt("lbl_include_time_column")}
                      checked={includeTimeColumn}
                      onChange={doChangeIncludeTimeColumn}/>
          </div>
          <Divider/>
          {
            signalsWithInstances.map(([signal, instance]) =>
              <ExportedSignal key={instance.scaleId}
                              id={instance.scaleId}
                              checked={exportedSignal[instance.scaleId]}
                              color={instance.style.color}
                              label={`ID ${signal.deviceId}, ${signal.name}`}
                              onChange={doExportedSignalChange}/>)
          }
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
    exportAsCsv: (signalsWithInstances: Array<[ISignalState, ISignalInstanceState]>) =>
      dispatch(exportAsCsv(signalsWithInstances)),
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(DisplayExportMenu);
