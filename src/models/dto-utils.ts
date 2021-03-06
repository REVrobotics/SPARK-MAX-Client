import {negate} from "lodash";
import {RootResponseDto} from "../../public/proto-gen";

type ResponseWithError = RootResponseDto | {root?: RootResponseDto};

/**
 * Returns true if given object is {@link RootResponseDto}
 * @param response
 */
export const isRootResponse = (response: any): response is RootResponseDto => response.hasOwnProperty("error");

/**
 * Returns {@link RootResponseDto}.
 * Typically {@link RootResponseDto} is a response itself of it is contained under `root` field of response.
 */
export const getRootResponse = (response?: ResponseWithError): RootResponseDto|undefined =>
  response == null || isRootResponse(response) ? response : response.root;

/**
 * If given response has some error.
 */
export const hasError = (response?: ResponseWithError): boolean => {
  const root = getRootResponse(response);

  return root ? !!root.error : false;
};

/**
 * Returns error text of the response
 * @param response
 */
export const getErrorText = (response?: ResponseWithError): string => {
  const root = getRootResponse(response);

  return root && root.error || "";
};

const isDigitOnlyKey = (key: string) => /^\d+$/.test(key);

/**
 * Returns values of the provided number-based enum
 */
export const enumValues = (enumDef: any) => Object.keys(enumDef).filter(isDigitOnlyKey).map(Number);
/**
 * Returns names of the provided number-based enum
 */
export const enumNames = (enumDef: any) => Object.keys(enumDef).filter(negate(isDigitOnlyKey));
