import {
  getDeviceConfigurationId,
  getDeviceConfigurationName,
  IApplicationState,
  IDeviceConfiguration, isDefaultDeviceConfiguration
} from "../store/state";
import {connect} from "react-redux";
import PersistentSelect from "../components/PersistentSelect";
import InputDialog from "../components/InputDialog";
import * as React from "react";
import {useCallback, useState} from "react";
import {SparkDispatch} from "../store/actions";
import {
  removeConfiguration,
  renameConfiguration,
  saveConfiguration,
  saveConfigurationAs,
  selectConfiguration
} from "../store/actions/configuration-actions";
import {
  queryConfigurations,
  queryIsSelectedConfigurationDirty,
  querySelectedConfiguration
} from "../store/selectors";

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
}

const ConfigurationSelect = (props: IProps) => {
  const {selected, configurations, disabled, onSelect, onRename, onSave, onSaveAs, onRemove} = props;

  const isModifiable = selected ? !isDefaultDeviceConfiguration(selected) : false;

  const rename = useCallback((newName) => onRename(selected, newName), [selected]);

  const [saveAsOpened, setSaveAsOpened] = useState(false);
  const openSaveAsDialog = useCallback(() => setSaveAsOpened(true), []);
  const closeSaveAsDialog = useCallback(() => setSaveAsOpened(false), []);
  const saveAs = useCallback((name) => onSaveAs(selected, name), [selected]);

  const [renameOpened, setRenameOpened] = useState(false);
  const openRenameDialog = useCallback(() => setRenameOpened(true), []);
  const closeRenameDialog = useCallback(() => setRenameOpened(false), []);

  const selectedName = getDeviceConfigurationName(selected);

  return (
    <>
      <InputDialog title={`Save Configuration "${selectedName}" As`}
                   message={"Enter Name"}
                   input={selectedName}
                   okLabel="Create"
                   cancelLabel="Cancel"
                   isOpened={saveAsOpened}
                   onOk={saveAs}
                   onCancel={closeSaveAsDialog}/>
      <InputDialog title={`Rename Configuration "${selectedName}"`}
                   message={"Enter New Name"}
                   input={selectedName}
                   okLabel="Rename"
                   cancelLabel="Cancel"
                   isOpened={renameOpened}
                   onOk={rename}
                   onCancel={closeRenameDialog}/>
      <PersistentSelect selected={selected}
                        items={configurations}
                        disabled={disabled}
                        modifiable={isModifiable}
                        getKey={getDeviceConfigurationId}
                        getText={getDeviceConfigurationName}
                        onRename={openRenameDialog}
                        onSelect={onSelect}
                        onSave={onSave}
                        onSaveAs={openSaveAsDialog}
                        onRemove={onRemove}/>
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
    onSelect: (item: IDeviceConfiguration) => dispatch(selectConfiguration(item)),
    onRename: (item: IDeviceConfiguration, newName: string) => dispatch(renameConfiguration(item, newName)),
    onSave: (item: IDeviceConfiguration) => dispatch(saveConfiguration(item)),
    onSaveAs: (item: IDeviceConfiguration, name: string) => dispatch(saveConfigurationAs(item, name)),
    onRemove: (item: IDeviceConfiguration) => dispatch(removeConfiguration(item)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ConfigurationSelect);
