import {fromPairs} from "lodash";
import {Button, Checkbox, Classes, Dialog, Divider} from "@blueprintjs/core";
import * as React from "react";
import {useCallback, useState} from "react";
import {
  IApplicationState,
  IDisplayCsvExportSettings,
  IDisplayExportSettings,
  ISignalInstanceState,
  ISignalState
} from "../store/state";
import {connect} from "react-redux";
import {setCsvExportDialogOpened, setCsvExportSetting, SparkDispatch} from "../store/actions";
import {exportAsCsv} from "../store/actions/display-export-actions";
import {queryDisplayExportSettings} from "../store/selectors";

interface IOwnProps {
  signalsWithInstances: Array<[ISignalState, ISignalInstanceState]>;
}

interface IProps extends IOwnProps {
  settings: IDisplayExportSettings;

  setCsvExportDialogOpened(isOpened: boolean): void;

  setCsvExportSetting(key: keyof IDisplayCsvExportSettings, value: any): void;

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
      <span><div className="csv__signal-sample" style={{background: color}}/>
        {label}</span>
    </Checkbox>
  );
};

const CsvExportDialog = (props: IProps) => {
  const {
    signalsWithInstances,
    settings: {isCsvExportInProcess, csv: {includeTimeColumn}},
    setCsvExportDialogOpened: setCsvDialogOpened, setCsvExportSetting: setCsvSetting,
  } = props;

  const [exportedSignal, setExportedSignal] = useState(() =>
    fromPairs(signalsWithInstances.map(([_, instance]) => [instance.scaleId, true])));

  const doExportedSignalChange = useCallback((id: string, isExported: boolean) => setExportedSignal({
    ...exportedSignal,
    [id]: isExported,
  }), [exportedSignal]);

  const doCloseCsvExportDialog = useCallback(() => setCsvDialogOpened(false), []);
  const doChangeIncludeTimeColumn = useCallback(
    () => setCsvSetting("includeTimeColumn", !includeTimeColumn),
    [includeTimeColumn]);

  const doExportAsCsv = useCallback(
    () => props.exportAsCsv(signalsWithInstances.filter(([_, instance]) => exportedSignal[instance.scaleId])),
    [exportedSignal]);

  return (
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
};

const mapStateToProps = (state: IApplicationState) => {
  return {
    settings: queryDisplayExportSettings(state),
  };
};

const mapDispatchToProps = (dispatch: SparkDispatch) => {
  return {
    setCsvExportDialogOpened: (isOpened: boolean) => dispatch(setCsvExportDialogOpened(isOpened)),
    setCsvExportSetting: (key: keyof IDisplayCsvExportSettings, value: any) =>
      dispatch(setCsvExportSetting(key, value)),
    exportAsCsv: (signalsWithInstances: Array<[ISignalState, ISignalInstanceState]>) =>
      dispatch(exportAsCsv(signalsWithInstances)),
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(CsvExportDialog);
