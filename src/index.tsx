import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Provider} from "react-redux";
import {createStore} from "redux";
import App from './App';
import './index.css';
import registerServiceWorker from './registerServiceWorker';
import reducer from "./store/reducer";

const applicationStore = createStore(reducer);
const ipcRenderer = (window as any).require("electron").ipcRenderer;
const headless = false;

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