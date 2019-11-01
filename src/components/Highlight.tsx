import * as React from "react";

interface IProps {
  text: string;
  indices: number[][];
}

interface PartOfText {
  index: number[];
  highlight: boolean;
}

/**
 * Prepares text partition to be used to split specific text
 */
const textPartition = (indices: number[][] = [], length: number): PartOfText[] => {
  let lastEnd = 0;
  const buffer: PartOfText[] = [];
  indices.forEach((index) => {
    const [start, end] = index;
    if (lastEnd !== start) {
      buffer.push({highlight: false, index: [lastEnd, start]});
    }
    buffer.push({highlight: true, index});
    lastEnd = end;
  });
  if (lastEnd !== length) {
    buffer.push({highlight: false, index: [lastEnd, length]});
  }
  return buffer;
};

/**
 * This component highlights text using provided partition
 */
const Highlight = (props: IProps) => {
  const {text, indices} = props;
  const parts = textPartition(indices, text.length);
  return (
    <span className="text-pre">
      {parts.map(({index: [start, end], highlight}, i) =>
        highlight ?
          <span key={i} className="highlight">{text.substring(start, end)}</span>
          : text.substring(start, end))}
    </span>
  )
};

export default Highlight;
