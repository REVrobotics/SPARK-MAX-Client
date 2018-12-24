import {default as Axios, AxiosInstance, AxiosRequestConfig, AxiosError, AxiosResponse} from "axios";

export interface IHttpError {
  code: number,
  message: string
}

class WebProvider {
  private static _instance: WebProvider;

  private _axios: AxiosInstance;
  private _config: AxiosRequestConfig;
  private _host: string;

  public static getInstance(): WebProvider {
    if (typeof WebProvider._instance === "undefined") {
      WebProvider._instance = new WebProvider();
    }
    return WebProvider._instance;
  }

  private constructor() {}

  /**
   * This method must be called before retrieving data. Since this class implements the singleton design
   * and the network of EMS may change, the provider must be manually initialized at runtime.
   * @param host The host address.
   */
  public initialize(host: string): void {
    this._host = "https://" + host + "/";
    this._config = {
      baseURL: this._host,
      timeout: 5000,
      headers: {
        "Content-Type": "text/plain"
      }
    };
    this._axios = Axios.create(this._config);
  }

  public get(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (typeof this._axios === "undefined" || typeof this._host === "undefined") {
        const error: IHttpError = {code: 500, message: "The provider's host address has not been initialized."};
        reject(error);
      }
      this._axios.get(url, {data: {}}).then((response: AxiosResponse) => {
        if (typeof response.data !== "undefined") {
          resolve(response.data);
        } else {
          const error: IHttpError = {code: 500, message: "No data was provided from the response."};
          reject(error);
        }
      }).catch((error: AxiosError) => {
        if (error.response) {
          reject(error);
        } else {
          const httpError: IHttpError = {code: 404, message: "Connection was refused."};
          reject(httpError);
        }
      });
    });
  }
}

export default WebProvider.getInstance();