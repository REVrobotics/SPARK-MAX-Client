import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Provider} from "react-redux";
import {applyMiddleware, createStore} from "redux";
import {composeWithDevTools} from "redux-devtools-extension";
import thunk from "redux-thunk";
import "./mls";
import App from './App';
import './index.css';
import registerServiceWorker from './registerServiceWorker';
import rootReducer from "./store/reducers";
import actionSchedule from "./store/actions/action-schedule";
import {sendTwoWay} from "./managers/ipc-renderer-calls";
import {reduxScheduler} from "./utils/redux-scheduler";
import {errorHandler} from "./utils/redux-error-handler";

if (process.env.NODE_ENV === "development") {
  // include mocked calls in DEV mode
  require("./managers/mocked-calls");
}

const composeEnhancers = composeWithDevTools({});

const applicationStore = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(reduxScheduler(actionSchedule), errorHandler, thunk)));
// read value passed from the main process
const electron = (window as any).require("electron");
const {remote, crashReporter} = electron;
const headless = remote.getGlobal("headless");
const crashReporterOptions = remote.getGlobal("crashReporterOptions");

crashReporter.start(crashReporterOptions);

if (headless) {
  ReactDOM.render(
    <Provider store={applicationStore}>
      <App/>
    </Provider>,
    document.getElementById('root') as HTMLElement
  );
  registerServiceWorker();
} else {
  sendTwoWay("start-server").then(() => {
    ReactDOM.render(
      <Provider store={applicationStore}>
        <App/>
      </Provider>,
      document.getElementById('root') as HTMLElement
    );
    registerServiceWorker();
  });
}
