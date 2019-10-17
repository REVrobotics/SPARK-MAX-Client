import * as React from "react";
import {ReactNode} from "react";
import classNames from "classnames";
import {WaveformEngine} from "../display-interfaces";
import {WaveformEngineContext} from "./waveform-engine-context";

interface Props {
  className?: string;
  engine: WaveformEngine;
  children: ReactNode;
}

const WaveformDisplay = (props: Props) => {
  const { className, engine, children } = props;

  return (
    <WaveformEngineContext.Provider value={engine}>
      <div className={classNames("waveform-display", className)}>
        {children}
      </div>
    </WaveformEngineContext.Provider>
  );
};

export default WaveformDisplay;
