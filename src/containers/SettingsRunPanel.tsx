import classNames from "classnames";
import {constant} from "lodash";
import * as React from "react";
import {ChangeEvent, ComponentType, useCallback} from "react";
import {FormGroup, Switch} from "@blueprintjs/core";
import {
  DisplaySettings,
  getDisplaySettingConstraints,
  IApplicationState,
  IFieldConstraints,
  INumericFieldConstraints
} from "../store/state";
import {connect} from "react-redux";
import {queryDisplaySettings} from "../store/selectors";
import {SparkDispatch} from "../store/actions";
import {Dictionary, IDictionaryWord, LEGEND_POSITIONS} from "../store/dictionaries";
import SafeNumericInput, {SafeNumericBehavior} from "../components/SafeNumericInput";
import {setAndPersistDisplaySetting} from "../store/actions/display-actions";
import DictionarySelect from "../components/DictionarySelect";

interface Props {
  settings: DisplaySettings;
}

interface SettingProps {
  name: keyof DisplaySettings;
  label: string;
  align?: "right";
  disabled?: boolean;
  constraints?: IFieldConstraints;
  safeInvalidValue?: any;
}

type ConnectedSettingProps = SettingProps & {
  value: any;
  onValueChange(value: any): void;
};

const bindRunSetting = (component: ComponentType<ConnectedSettingProps>): ComponentType<SettingProps> => {
  const mapStateToPropsSetting = (state: IApplicationState, props: SettingProps) => {
    const settings = queryDisplaySettings(state);
    return {
      value: settings[props.name],
      constraints: getDisplaySettingConstraints(props.name),
    }
  };

  const mapDispatchToPropsSetting = (dispatch: SparkDispatch, props: SettingProps) => {
    return {
      onValueChange: (value: any) => dispatch(setAndPersistDisplaySetting(props.name, value)),
    };
  };

  return connect(mapStateToPropsSetting, mapDispatchToPropsSetting)(component);
};

type NumericSettingProps = ConnectedSettingProps & {
  constraints: INumericFieldConstraints;
  safeInvalidValue?: number;
};

const NumericSetting = bindRunSetting((props: NumericSettingProps) => {
  const {
    label, value, constraints, disabled, align, safeInvalidValue,
    onValueChange,
  } = props;

  const className = classNames("form-group-setting", `form-group-setting--${align || "left"}`);
  const min = constraints ? constraints.min : undefined;
  const max = constraints ? constraints.max : undefined;

  return (
    <FormGroup
      className={className}
      label={label}
      disabled={disabled}
      inline={true}
      labelFor="input"
    >
      <SafeNumericInput
        id="input"
        value={value}
        disabled={disabled}
        onValueChange={onValueChange}
        safeBehavior={SafeNumericBehavior.Clamp}
        safeInvalidValue={safeInvalidValue}
        min={min}
        max={max}
      />
    </FormGroup>
  );
});

const EnumSetting = bindRunSetting((props: ConnectedSettingProps & { dictionary: Dictionary }) => {
  const {
    label, value, dictionary, disabled, align,
    onValueChange,
  } = props;

  const className = classNames("form-group-setting", `form-group-setting--${align || "left"}`);

  const onChange = useCallback((item: IDictionaryWord) => onValueChange(item.id), []);

  return (
    <FormGroup
      className={className}
      label={label}
      disabled={disabled}
      inline={true}
      labelFor="input"
    >
      <DictionarySelect dictionary={dictionary} value={value} onValueChange={onChange}/>
    </FormGroup>
  );
}) as ComponentType<SettingProps & { dictionary: Dictionary }>;

const BooleanSetting = bindRunSetting((props: ConnectedSettingProps) => {
  const {
    label, value, align,
    onValueChange,
  } = props;

  const className = classNames("form-group-setting", `form-group-setting--${align || "left"}`);
  const onChange = useCallback((event: ChangeEvent<HTMLInputElement>) => onValueChange(event.target.checked), []);

  return (
    <FormGroup
      className={className}
      label={label}
      inline={true}
    >
      <Switch
        checked={value}
        onChange={onChange}
      />
    </FormGroup>
  );
});

const SettingsRunPanel = (props: Props) => {
  const {settings} = props;

  return (
    <div className="run-settings-panel form-column full-width">
      <NumericSetting name="timeSpan" label={tt("lbl_time_span")} safeInvalidValue={30}/>
      <BooleanSetting name="singleChart" label={tt("lbl_show_single_chart")}/>
      <BooleanSetting name="showLegend" label={tt("lbl_show_legend")}/>
      <EnumSetting name="legendPosition"
                   label={tt("lbl_legend_position")}
                   disabled={!settings.showLegend}
                   dictionary={LEGEND_POSITIONS}/>
    </div>
  );
};

const mapStateToProps = (state: IApplicationState) => ({ settings: queryDisplaySettings(state) });
const mapDispatchToProps = constant({});

export default connect(mapStateToProps, mapDispatchToProps)(SettingsRunPanel);
