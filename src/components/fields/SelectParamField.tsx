import {find} from "lodash";
import {Button, IButtonProps, MenuItem} from "@blueprintjs/core";
import * as React from "react";
import {ButtonHTMLAttributes, useCallback} from "react";
import {IConfigParamProps} from "../config-param-props";
import {IItemRendererProps, ISelectProps, Select} from "@blueprintjs/select";
import {maybeMap} from "../../utils/object-utils";
import {getWordText, IDictionaryWord} from "../../store/dictionaries";

const DictionarySelect = Select.ofType<IDictionaryWord>();

const NO_OPTIONS: IDictionaryWord[] = [];

interface IProps extends IConfigParamProps {
  className?: string;
  placeholder?: string;
  selectProps?: Partial<ISelectProps<IDictionaryWord>>;
  buttonProps?: IButtonProps & Partial<ButtonHTMLAttributes<HTMLButtonElement>>;
}

const optionRenderer = (option: IDictionaryWord, itemProps: IItemRendererProps) => {
  return (
    <MenuItem
      active={itemProps.modifiers.active}
      key={option.id}
      onClick={itemProps.handleClick}
      text={option.text}
    />
  );
};

const SelectParamField = ({
                            buttonProps, selectProps, className, parameter, disabled, value, options, placeholder,
                            onValueChange,
                          }: IProps) => {
  const onChange = useCallback((item) => onValueChange(parameter, item.id), [parameter]);

  const selectedOption = find(options, {id: value});
  const selectedText = value != null ? maybeMap(selectedOption, getWordText) : placeholder;

  return (
    <DictionarySelect className={className}
                      {...selectProps}
                      items={options || NO_OPTIONS}
                      disabled={disabled}
                      activeItem={selectedOption}
                      filterable={false}
                      itemRenderer={optionRenderer}
                      onItemSelect={onChange}>
      <Button {...buttonProps}
              fill={true}
              disabled={disabled}
              title={selectedText}
              text={selectedText}
              rightIcon="double-caret-vertical"/>
    </DictionarySelect>
  )
};

export default SelectParamField;
