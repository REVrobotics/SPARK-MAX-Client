import {default as createDisplay} from "./components/create-waveform-display";
import {default as Engine} from "./chartjs-waveform-engine";
import {default as Chart} from "./components/WaveformChart";
import {default as Scale} from "./components/WaveformScale";
import {default as DefaultDataSet} from "./components/DataSet";

export const createWaveformDisplay = createDisplay;
export const ChartjsWaveformEngine = Engine;
export const WaveformChart = Chart;
export const WaveformScale = Scale;
export const DataSet = DefaultDataSet;

export const waveformEngine = new ChartjsWaveformEngine();
export const WaveformEngineDisplay = createWaveformDisplay(waveformEngine);
