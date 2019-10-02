import {RootResponseDto} from "../../public/proto-gen";

type ResponseWithError = RootResponseDto | {root?: RootResponseDto};

export const isRootResponse = (response: any): response is RootResponseDto => response.hasOwnProperty("error");

export const getRootResponse = (response?: ResponseWithError): RootResponseDto|undefined =>
  response == null || isRootResponse(response) ? response : response.root;

export const hasError = (response?: ResponseWithError): boolean => {
  const root = getRootResponse(response);

  return root ? root.error != null : false;
};

export const getErrorText = (response?: ResponseWithError): string => {
  const root = getRootResponse(response);

  return root && root.error || "";
};
