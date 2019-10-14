import {ReactElement, useState} from "react";
import {Pipe, subscribePipe} from "../utils/react-utils";

interface IFocusableElement {
  select?(): void;
  focus(): void;
}

interface IProps {
  /**
   * Whether element should be selected on focus.
   * For {@link HTMLInputElement} it means selection of whole text.
   */
  select?: boolean;
  children: ReactElement<any> | null;
  /**
   * Pipe should emit focusable element
   */
  pipe: Pipe<IFocusableElement>;
}

/**
 * This component focuses target element as soon as it is retrieved by {@link Pipe}.
 * This component allows to focus element right after its creation.
 * {@link Pipe} allows to decouple lifecycle of focusable element from lifecycle of {@link Focus} component.
 */
const Focus = (props: IProps) => {
  // This component focuses element just once
  const [focusedOnce, setFocusedOnce] = useState(false);

  // Focus target element as soon as it will be created
  subscribePipe(props.pipe, (el: IFocusableElement) => {
    if (el && !focusedOnce) {
      el.focus();
      // Select element as soon as it becomes focused
      if (props.select && el.select) {
        el.select();
      }
      setFocusedOnce(true);
    }
  });

  return props.children;
};

export default Focus;
