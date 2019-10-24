import {Dictionary, getWordText, IDictionaryWord} from "../store/dictionaries";
import * as React from "react";
import {useCallback} from "react";
import {IItemRendererProps, Select} from "@blueprintjs/select";
import {Button, MenuItem} from "@blueprintjs/core";

interface IProps {
  className?: string;
  dictionary: Dictionary;
  disabled?: boolean;
  value: any;

  onValueChange(value: any): void;
}

const wordRenderer = (item: IDictionaryWord, itemProps: IItemRendererProps) =>
  <MenuItem key={item.id} text={item.text} onClick={itemProps.handleClick}/>;

const DictionarySelect = (props: IProps) => {
  const {
    className,
    value, dictionary, disabled,
    onValueChange,
  } = props;

  const onChange = useCallback((item: IDictionaryWord) => onValueChange(item.id), []);

  return (
    <Select
      className={className}
      itemRenderer={wordRenderer}
      filterable={false}
      disabled={disabled}
      items={dictionary.seq()}
      onItemSelect={onChange}
    >
      <Button fill={true}
              disabled={disabled}
              text={value != null ? getWordText(dictionary.get(value)) : ""}
              rightIcon="double-caret-vertical"/>
    </Select>
  );
};

export default DictionarySelect;
