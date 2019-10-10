import {
  findDeviceConfigurationByName,
  getDeviceConfigurationId,
  getDeviceConfigurationName,
  IApplicationState,
  IDeviceConfiguration,
  isDefaultDeviceConfiguration
} from "../store/state";
import {connect} from "react-redux";
import PersistentSelect from "../components/PersistentSelect";
import InputDialog from "../components/InputDialog";
import * as React from "react";
import {ReactNode, useCallback, useState} from "react";
import {SparkDispatch} from "../store/actions";
import {
  applyConfigurationForSelectedDevice,
  destroyConfiguration,
  renameConfiguration,
  saveConfiguration,
  saveConfigurationAs,
  selectConfigurationForSelectedDevice
} from "../store/actions/configuration-actions";
import {queryConfigurations, queryIsSelectedConfigurationDirty, querySelectedConfiguration} from "../store/selectors";

interface IOwnProps {
  disabled?: boolean;
}

interface IProps extends IOwnProps {
  selected: IDeviceConfiguration;
  configurations: IDeviceConfiguration[];
  isDirty: boolean;

  onSelect(item: IDeviceConfiguration): void;

  onRename(item: IDeviceConfiguration, newName: string): void;

  onSave(item: IDeviceConfiguration): void;

  onSaveAs(item: IDeviceConfiguration, name: string): void;

  onRemove(item: IDeviceConfiguration): void;

  onRestore(item: IDeviceConfiguration): void;
}

const ConfigurationSelect = (props: IProps) => {
  const {
    selected, isDirty, configurations, disabled,
    onSelect, onRename, onSave, onSaveAs, onRemove, onRestore,
  } = props;

  const isModifiable = selected ? !isDefaultDeviceConfiguration(selected) : false;

  const rename = useCallback((newName) => {
    setRenameOpened(false);
    onRename(selected, newName);
  }, [selected]);

  const [saveAsOpened, setSaveAsOpened] = useState(false);
  const openSaveAsDialog = useCallback(() => setSaveAsOpened(true), []);
  const closeSaveAsDialog = useCallback(() => setSaveAsOpened(false), []);
  const saveAs = useCallback((name) => {
    setSaveAsOpened(false);
    onSaveAs(selected, name);
  }, [selected]);
  const validateNameForSaveAs = useCallback((name) => {
    if (findDeviceConfigurationByName(configurations, name)) {
      return "Name is not unique";
    }
    return;
  }, []);

  const [renameOpened, setRenameOpened] = useState(false);
  const openRenameDialog = useCallback(() => setRenameOpened(true), []);
  const closeRenameDialog = useCallback(() => setRenameOpened(false), []);
  const validateNameForRename = useCallback((name) => {
    if (findDeviceConfigurationByName(configurations, name, selected.id)) {
      return "Name is not unique";
    }
    return;
  }, [selected]);

  const selectedName = getDeviceConfigurationName(selected);

  let saveAsDialog: ReactNode | undefined;
  if (saveAsOpened) {
    saveAsDialog = <InputDialog title={`Create New Configuration`}
                                message={"Enter Name"}
                                input={selectedName}
                                validate={validateNameForSaveAs}
                                okLabel="Create"
                                cancelLabel="Cancel"
                                isOpened={saveAsOpened}
                                onOk={saveAs}
                                onCancel={closeSaveAsDialog}/>;
  }

  let renameDialog: ReactNode | undefined;
  if (renameOpened) {
    renameDialog = <InputDialog title={`Rename Configuration`}
                                message={"Enter New Name"}
                                input={selectedName}
                                validate={validateNameForRename}
                                okLabel="Rename"
                                cancelLabel="Cancel"
                                isOpened={renameOpened}
                                onOk={rename}
                                onCancel={closeRenameDialog}/>;
  }

  return (
    <>
      {saveAsDialog}
      {renameDialog}
      <PersistentSelect selected={selected}
                        isDirty={isDirty}
                        items={configurations}
                        disabled={disabled}
                        modifiable={isModifiable}
                        getKey={getDeviceConfigurationId}
                        getText={getDeviceConfigurationName}
                        onRename={openRenameDialog}
                        onSelect={onSelect}
                        onSave={onSave}
                        onSaveAs={openSaveAsDialog}
                        onRemove={onRemove}
                        onRestore={onRestore}/>
    </>
  )
};

function mapStateToProps(state: IApplicationState) {
  return {
    selected: querySelectedConfiguration(state),
    configurations: queryConfigurations(state),
    isDirty: queryIsSelectedConfigurationDirty(state),
  }
}

function mapDispatchToProps(dispatch: SparkDispatch) {
  return {
    onSelect: (item: IDeviceConfiguration) => dispatch(selectConfigurationForSelectedDevice(item)),
    onRename: (item: IDeviceConfiguration, newName: string) => dispatch(renameConfiguration(item, newName)),
    onSave: (item: IDeviceConfiguration) => dispatch(saveConfiguration(item)),
    onSaveAs: (item: IDeviceConfiguration, name: string) => dispatch(saveConfigurationAs(item, name)),
    onRemove: (item: IDeviceConfiguration) => dispatch(destroyConfiguration(item)),
    onRestore: (item: IDeviceConfiguration) => dispatch(applyConfigurationForSelectedDevice(item)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ConfigurationSelect);
