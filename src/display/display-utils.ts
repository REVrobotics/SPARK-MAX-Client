
export const truncateByTime = <T>(data: T[], timeSpan: number, getTime: (item: T) => number) => {
  const lastPoint = data[data.length - 1];

  while (data.length > 2) {
    const nextPoint = data[1];
    if ((getTime(lastPoint) - getTime(nextPoint)) <= timeSpan) {
      break;
    }

    data.shift();
  }
};
