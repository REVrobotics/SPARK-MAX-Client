import {Button, Drawer, Icon, Position} from "@blueprintjs/core";
import * as React from "react";
import {useCallback, useState} from "react";
import {useRefEffect} from "../utils/react-utils";

export interface IProps {
  text: string[];
  height?: string;
  expandedHeight?: string;
}

/**
 * `Console` represents expandable element bound to the bottom of the screen.
 * It allows to show long appendable content.
 * Component always scrolls to the bottom when new content is added.
 */
const Console = (props: IProps) => {
  const {text, height, expandedHeight} = props;

  const [opened, setOpened] = useState(false);
  const toggleConsole = useCallback(() => setOpened(!opened), [opened]);
  // Scrolls to the bottom when new content is added
  const outputEl = useRefEffect<HTMLDivElement>((el) => {
    el.scrollTop = el.scrollHeight;
  }, [text]);

  return (
    <Drawer className="console"
            usePortal={true}
            hasBackdrop={opened}
            portalClassName="console-portal"
            isOpen={true}
            canEscapeKeyClose={false}
            enforceFocus={false}
            transitionDuration={opened ? 300 : 0}
            position={Position.BOTTOM}
            size={opened ? (expandedHeight || Drawer.SIZE_LARGE) : height}>
      <div className="console__header">
        <div className="console__title">
          <Icon icon="console" color="#5c7080"/>
          &nbsp;Console
        </div>
        <Button minimal={true}
                small={true}
                rightIcon={opened ? "double-chevron-down" : "double-chevron-up"}
                className="console__toggle-btn"
                text={opened ? "Show Less" : "Show More"}
                onClick={toggleConsole}/>
      </div>
      <div ref={outputEl} className="console__output">
        {text.map((line, index) => {
          return <p key={index}>{line}</p>;
        })}
      </div>
    </Drawer>
  );
};

export default Console;
