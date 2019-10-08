import {ReactElement, useState} from "react";
import {Pipe, subscribePipe} from "../utils/react-utils";

interface IFocusableElement {
  select?(): void;
  focus(): void;
}

interface IProps {
  select?: boolean;
  children: ReactElement<any> | null;
  pipe: Pipe<IFocusableElement>;
}

const Focus = (props: IProps) => {
  const [focusedOnce, setFocusedOnce] = useState(false);
  subscribePipe(props.pipe, (el: IFocusableElement) => {
    if (el && !focusedOnce) {
      el.focus();
      if (props.select && el.select) {
        el.select();
      }
      setFocusedOnce(true);
    }
  });

  return props.children;
};

export default Focus;
