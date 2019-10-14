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
  overwriteConfiguration,
  createConfiguration,
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

  onOverwrite(item: IDeviceConfiguration): void;

  onCreate(item: IDeviceConfiguration, name: string): void;

  onRemove(item: IDeviceConfiguration): void;

  onApply(item: IDeviceConfiguration): void;
}

const ConfigurationSelect = (props: IProps) => {
  const {
    selected, isDirty, configurations, disabled,
    onSelect, onRename, onOverwrite, onCreate, onRemove, onApply,
  } = props;

  const isModifiable = selected ? !isDefaultDeviceConfiguration(selected) : false;

  const rename = useCallback((newName) => {
    setRenameOpened(false);
    onRename(selected, newName);
  }, [selected]);

  // Logic for create action:
  // - show input dialog to enter name
  // - validation to check that name is unique
  const [createOpened, setCreateOpened] = useState(false);
  const openCreateDialog = useCallback(() => setCreateOpened(true), []);
  const closeCreateDialog = useCallback(() => setCreateOpened(false), []);
  const create = useCallback((name) => {
    setCreateOpened(false);
    onCreate(selected, name);
  }, [selected]);
  const validateNameForCreate = useCallback((name) => {
    if (findDeviceConfigurationByName(configurations, name)) {
      return "Name is not unique";
    }
    return;
  }, [configurations]);

  // Logic for rename action:
  // - show input dialog to enter new name
  // - validation to check that name is unique
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

  let createDialog: ReactNode | undefined;
  if (createOpened) {
    createDialog = <InputDialog title={`Create New Configuration`}
                                message={"Enter Name"}
                                input={selectedName}
                                validate={validateNameForCreate}
                                okLabel="Create"
                                cancelLabel="Cancel"
                                isOpened={createOpened}
                                onOk={create}
                                onCancel={closeCreateDialog}/>;
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
      {createDialog}
      {renameDialog}
      <PersistentSelect selected={selected}
                        isDirty={isDirty}
                        items={configurations}
                        disabled={disabled}
                        appliable={!isDefaultDeviceConfiguration(selected)}
                        modifiable={isModifiable}
                        getKey={getDeviceConfigurationId}
                        getText={getDeviceConfigurationName}
                        onRename={openRenameDialog}
                        onSelect={onSelect}
                        onOverwrite={onOverwrite}
                        onCreate={openCreateDialog}
                        onRemove={onRemove}
                        onApply={onApply}/>
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
    onOverwrite: (item: IDeviceConfiguration) => dispatch(overwriteConfiguration(item)),
    onCreate: (item: IDeviceConfiguration, name: string) => dispatch(createConfiguration(item, name)),
    onRemove: (item: IDeviceConfiguration) => dispatch(destroyConfiguration(item)),
    onApply: (item: IDeviceConfiguration) => dispatch(applyConfigurationForSelectedDevice(item)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ConfigurationSelect);
