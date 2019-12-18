import {onTwoWayCall} from "./ipc-main-calls";
import {BrowserWindow, dialog} from "electron";
import {uniqueId} from "lodash";
import * as fs from "fs";
import {createObjectCsvWriter} from "csv-writer";

interface IStreamState {
  path: string;
  writer: any;
}

const streams: {[id: string]: IStreamState} = {};

onTwoWayCall("file:save-as", (cb, {fileName, data, filters}) => {
  dialog.showSaveDialog(BrowserWindow.getFocusedWindow()!, {
    title: "Save File As...",
    defaultPath: fileName,
    filters,
  }, (savedFileName) => {
    if (savedFileName) {
      fs.writeFileSync(savedFileName, data);
      cb(null, true);
    } else {
      cb(null, false);
    }
  })
});

onTwoWayCall("file:stream-open", (cb, {fileName, type, filters}) => {
  if (type !== "csv") {
    throw new Error("Currently only streaming of CSV data is supported");
  }

  dialog.showSaveDialog(BrowserWindow.getFocusedWindow()!, {
    title: "Save File As...",
    defaultPath: fileName,
    filters,
  }, (savedFileName) => {
    if (savedFileName) {
      const id = uniqueId("stream:");
      streams[id] = {path: savedFileName, writer: undefined};
      cb(null, id);
    } else {
      cb();
    }
  })
});

onTwoWayCall("file:stream-close", (cb, id) => {
  console.log("destroy file stream", id);
  delete streams[id];
  cb();
});

onTwoWayCall("file:stream-write-chunk", (cb, id, chunk) => {
  const stream = streams[id];
  if (stream == null) {
    throw new Error(`Stream does not exist for '${id}'`);
  }

  if (chunk.type === "meta") {
    if (stream.writer) {
      throw new Error(`Meta has been already written into this stream`);
    }
    console.log("write meta", chunk.meta);
    stream.writer = createObjectCsvWriter({
      path: stream.path,
      header: chunk.meta,
    });
    cb(null);
  } else if (chunk.type === "data") {
    if (stream.writer == null) {
      throw new Error(`Meta was not written into this stream yet`);
    }
    console.log("write data", chunk.data);
    stream.writer.writeRecords(chunk.data)
      .then(() => cb())
      .catch(cb);
  }
});
