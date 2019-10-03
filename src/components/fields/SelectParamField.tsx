import {find} from "lodash";
import {Button, MenuItem} from "@blueprintjs/core";
import * as React from "react";
import {useCallback} from "react";
import {IConfigParamProps} from "../config-param-props";
import {IItemRendererProps, Select} from "@blueprintjs/select";
import {maybeMap} from "../../utils/object-utils";
import {getWordText, IDictionaryWord} from "../../store/dictionaries";

const DictionarySelect = Select.ofType<IDictionaryWord>();

const NO_OPTIONS: IDictionaryWord[] = [];

interface IProps extends IConfigParamProps {
  className?: string;
  placeholder?: string;
}

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

  const selectedOption = find(options, {id: value});

  return (
    <DictionarySelect className={className}
                  items={options || NO_OPTIONS}
                  disabled={disabled}
                  filterable={false}
                  activeItem={selectedOption}
                  itemRenderer={optionRenderer} onItemSelect={onChange}>
      <Button fill={true}
              disabled={disabled}
              text={value != null ? maybeMap(selectedOption, getWordText) : placeholder}
              rightIcon="double-caret-vertical"/>
    </DictionarySelect>
  )
};

export default SelectParamField;
