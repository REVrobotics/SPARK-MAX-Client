import * as React from "react";
import {ReactNode} from "react";
import {WaveformEngine} from "../display-interfaces";
import WaveformDisplay from "./WaveformDisplay";

interface Props {
  className?: string;
  children: ReactNode;
}

/**
 * Creates component bound to the specified engine
 */
const createWaveformDisplay = (engine: WaveformEngine) => (props: Props) => {
  return (
    <WaveformDisplay engine={engine} {...props}>
      {props.children}
    </WaveformDisplay>
  );
};

export default createWaveformDisplay;
