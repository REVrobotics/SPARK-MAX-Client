import {find} from "lodash";
import {Button, MenuItem} from "@blueprintjs/core";
import * as React from "react";
import {useCallback} from "react";
import {IParamSourceProps} from "../param-source";
import {IItemRendererProps, Select} from "@blueprintjs/select";
import {maybeMap} from "../../utils/object-utils";
import {getWordText, IDictionaryWord} from "../../store/dictionaries";

const DictionarySelect = Select.ofType<IDictionaryWord>();

const NO_OPTIONS: IDictionaryWord[] = [];

interface IProps extends IParamSourceProps {
  className?: string;
  placeholder?: string;
}

const findOptionText = (options: IDictionaryWord[], value: any) =>
  maybeMap(find(options, {id: value}), getWordText);

const optionRenderer = (option: IDictionaryWord, itemProps: IItemRendererProps) => {
  return (
    <MenuItem
      key={option.id}
      onClick={itemProps.handleClick}
      text={option.text}
    />
  );
};

const SelectParamField = ({className, parameter, disabled, value, options, placeholder, onValueChange}: IProps) => {
  const onChange = useCallback((item) => onValueChange(parameter, item.id), []);

  return (
    <DictionarySelect className={className}
                  items={options || NO_OPTIONS}
                  disabled={disabled}
                  filterable={false}
                  itemRenderer={optionRenderer} onItemSelect={onChange}>
      <Button fill={true}
              disabled={disabled}
              text={value != null ? findOptionText(options || NO_OPTIONS, value) : placeholder}
              rightIcon="double-caret-vertical"/>
    </DictionarySelect>
  )
};

export default SelectParamField;
