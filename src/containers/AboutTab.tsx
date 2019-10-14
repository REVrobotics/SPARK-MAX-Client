import * as React from "react";
import SparkManager from "../managers/SparkManager";

class AboutTab extends React.Component {
  constructor(props: any) {
    super(props);
  }

  public render() {
    return (
      <div>
        <div>
          <h2>{tt("lbl_spark_max_client")}</h2>
          <p>
            {tt("lbl_spark_max_client_info")}
          </p>
          <p>
            {tt("lbl_spark_max_client_copyright")}
          </p>
        </div>
        <div>
          <p><b>{tt("lbl_server_version")}</b>: v1.1.61</p>
          <p><b>{tt("lbl_client_version")}</b>: v{SparkManager.getVersion()}</p>
        </div>
      </div>
    );
  }
}

export default AboutTab;
