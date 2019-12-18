import {isString} from "lodash";
import {sendTwoWay} from "./ipc-renderer-calls";
import {SYSTEM_ERROR_FILE_CATEGORY, SystemError} from "../models/errors";
import FileFilter = Electron.FileFilter;

const serializeData = (data: Blob | string): Promise<ArrayBuffer | string> => {
  if (isString(data)) {
    return Promise.resolve(data);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        resolve(new Buffer(reader.result as ArrayBuffer));
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(data);
  });
};

function wrapFileError<T>(promise: Promise<T>): Promise<T> {
  return promise
    // Specialize SystemError to make it obvious what is the source of error
    .catch((error: SystemError) => Promise.reject(error.specialize(() => ({category: SYSTEM_ERROR_FILE_CATEGORY}))));
}

class FileManager {

  public static getInstance(): FileManager {
    if (typeof FileManager._instance === "undefined") {
      FileManager._instance = new FileManager();
    }
    return FileManager._instance;
  }

  private static _instance: FileManager;

  private constructor() {
  }

  public saveAs(request: { fileName: string, data: Blob | string, filters: FileFilter[] }): Promise<boolean> {
    return wrapFileError(serializeData(request.data).then((data) => sendTwoWay("file:save-as", {...request, data})));
  }

  public openStream(request: { fileName: string, type: string, filters: FileFilter[] }): Promise<string> {
    return wrapFileError(sendTwoWay("file:stream-open", request));
  }

  public closeStream(id: string): Promise<void> {
    return wrapFileError(sendTwoWay("file:stream-close", id));
  }

  public writeChunk(id: string, chunk: any): Promise<void> {
    return wrapFileError(sendTwoWay("file:stream-write-chunk", id, chunk));
  }
}

export default FileManager.getInstance();
