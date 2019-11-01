import {toPairs} from "lodash";

export const colors = [
  "#aa00aa",
  "#e26a6a",
  "#00aa55",
  "#ff0000",
  "#e73c70",
  "#006060",
  "#ff4500",
  "#0000ff",
  "#aa8f00",
  "#d252b2",
  "#b381b3",
  "#d46a43",
  "#40806a",
  "#aa2e00",
  "#00ff00",
  "#34385e",
  "#d400d4",
  "#dc143c",
  "#1ba39c",
  "#ff00ff",
  "#382903",
  "#d47500",
  "#f62459",
  "#551700",
  "#7462e0",
  "#7d314c",
  "#6b8e23",
];

export const colorToIndex = toPairs(colors.map((color, i) => [color, i]));
