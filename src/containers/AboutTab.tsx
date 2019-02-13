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
          <h2>SPARK MAX Client</h2>
          <p>
            A way to update, configure, and test your SPARK MAX Motor Controller.
          </p>
          <p>
            Copyright © 2019 REV Robotics LLC (support@revrobotics.com) under Apache License v2.0
          </p>
        </div>
        <div>
          <p><b>Server Version</b>: v1.1.61</p>
          <p><b>Client Version</b>: v{SparkManager.getVersion()}</p>
        </div>
      </div>
    );
  }
}

export default AboutTab;