import classNames from "classnames";
import * as React from "react";
import {ReactNode} from "react";

interface IProps {
  className?: string;
  size?: number;
}

const iconFactory = (node: ReactNode) => (props: IProps) => {
  const size = `${props.size || 24}px`;
  return <div className={classNames("max-icon", props.className)} style={{width: size, height: size}}>{node}</div>;
};

export const InfoIcon = iconFactory(
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <path fill="none" d="M0 0h24v24H0V0z"/>
    <path
      d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
  </svg>
);

export const StopCircleRegularIcon = iconFactory(
  <svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="stop-circle"
       className="svg-inline--fa fa-stop-circle fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg"
       viewBox="0 0 512 512">
    <path fill="currentColor"
          d="M504 256C504 119 393 8 256 8S8 119 8 256s111 248 248 248 248-111 248-248zm-448 0c0-110.5 89.5-200 200-200s200 89.5 200 200-89.5 200-200 200S56 366.5 56 256zm296-80v160c0 8.8-7.2 16-16 16H176c-8.8 0-16-7.2-16-16V176c0-8.8 7.2-16 16-16h160c8.8 0 16 7.2 16 16z"/>
  </svg>
);

export const PlayCircleOutlineIcon = iconFactory(
  <svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="play-circle"
       className="svg-inline--fa fa-play-circle fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg"
       viewBox="0 0 512 512">
    <path fill="currentColor"
          d="M371.7 238l-176-107c-15.8-8.8-35.7 2.5-35.7 21v208c0 18.4 19.8 29.8 35.7 21l176-101c16.4-9.1 16.4-32.8 0-42zM504 256C504 119 393 8 256 8S8 119 8 256s111 248 248 248 248-111 248-248zm-448 0c0-110.5 89.5-200 200-200s200 89.5 200 200-89.5 200-200 200S56 366.5 56 256z"/>
  </svg>
);

export const PlayIcon = iconFactory(
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/><path d="M0 0h24v24H0z" fill="none"/></svg>
);

export const PauseIcon = iconFactory(
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/><path d="M0 0h24v24H0z" fill="none"/></svg>
);

export const StopIcon = iconFactory(
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M6 6h12v12H6z"/></svg>
);
