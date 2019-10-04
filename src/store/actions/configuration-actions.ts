import {IDeviceConfiguration} from "../state";
import {SparkAction} from "./action-types";

export const selectConfiguration = (item: IDeviceConfiguration): SparkAction<Promise<any>> => {
  return (dispatch, getState) => {
    return Promise.resolve();
  }
};

export const renameConfiguration = (item: IDeviceConfiguration, name: string): SparkAction<Promise<any>> => {
  return (dispatch, getState) => {
    return Promise.resolve();
  }
};

export const saveConfiguration = (item: IDeviceConfiguration): SparkAction<Promise<any>> => {
  return (dispatch, getState) => {
    return Promise.resolve();
  }
};

export const saveConfigurationAs = (item: IDeviceConfiguration, name: string): SparkAction<Promise<any>> => {
  return (dispatch, getState) => {
    return Promise.resolve();
  }
};

export const removeConfiguration = (item: IDeviceConfiguration): SparkAction<Promise<any>> => {
  return (dispatch, getState) => {
    return Promise.resolve();
  }
};
