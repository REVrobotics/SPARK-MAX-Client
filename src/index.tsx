import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Provider} from "react-redux";
import {applyMiddleware, createStore} from "redux";
import {composeWithDevTools} from "redux-devtools-extension";
import thunk from "redux-thunk";
import App from './App';
import './index.css';
import registerServiceWorker from './registerServiceWorker';
import reducer from "./store/reducer";

const composeEnhancers = composeWithDevTools({});

const applicationStore = createStore(reducer, composeEnhancers(applyMiddleware(thunk)));
// read value passed from the main process
const electron = (window as any).require("electron");
const {ipcRenderer, remote} = electron;
const headless = !remote.getGlobal("remote");

if (headless) {
  ReactDOM.render(
    <Provider store={applicationStore}>
      <App/>
    </Provider>,
    document.getElementById('root') as HTMLElement
  );
  registerServiceWorker();
} else {
  ipcRenderer.on("start-server-response", (event: any, error: any) => {
    ReactDOM.render(
      <Provider store={applicationStore}>
        <App/>
      </Provider>,
      document.getElementById('root') as HTMLElement
    );
    registerServiceWorker();
  });

  ipcRenderer.send("start-server");
}