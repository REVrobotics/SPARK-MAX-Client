import * as React from "react";
import {ChartId, WaveformEngine} from "../display-interfaces";

export const WaveformEngineContext = React.createContext<WaveformEngine>(null as any);
export const WaveformChartContext = React.createContext<ChartId>(null as any);

export type WithEngine<T> = T & { engine: WaveformEngine };
export type WithChartId<T> = T & { chartId: ChartId };
