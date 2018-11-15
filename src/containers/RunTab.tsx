import {Button, FormGroup, Radio, RadioGroup, Slider} from "@blueprintjs/core";
import ReactCharts from "echarts-for-react";
import * as React from "react";
import {connect} from "react-redux";
import {IApplicationState} from "../store/types";

interface IProps {
  connected: boolean
}

interface IState {
  mode: string,
  option: any,
  output: number,
  running: boolean
}

class RunTab extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      mode: "Percent",
      option: {
        series: [{
          data: [],
          type: 'line'
        }],
        xAxis: {
          name: "Time",
          type: 'category'
        },
        yAxis: {
          name: "Percent",
          type: 'value'
        }
      },
      output: 0,
      running: false
    };

    this.changeMode = this.changeMode.bind(this);
    this.changeOutput = this.changeOutput.bind(this);

    this.run = this.run.bind(this);
    this.stop = this.stop.bind(this);

    this.updateGraph = this.updateGraph.bind(this);

    this.listenForEmergencyStop = this.listenForEmergencyStop.bind(this);
  }

  public componentDidMount() {
    window.addEventListener("keydown", this.listenForEmergencyStop);
  }

  public componentWillUnmount() {
    window.removeEventListener("keydown", this.listenForEmergencyStop);
  }

  public render() {
    const {connected} = this.props;
    const {option, mode, output, running} = this.state;
    return (
      <div>
        <ReactCharts
          option={option}
          notMerge={true}
          lazyUpdate={true}
          className="echart-container"
        />
        <div className="form">
          <FormGroup
            labelFor="run-mode"
            className="form-group-quarter inline"
          >
            <RadioGroup
              label="Mode"
              selectedValue={mode}
              onChange={this.changeMode}
              disabled={!connected}
            >
              <Radio label="Percent" value={"Percent"}/>
              <Radio label="Velocity" value={"Velocity"}/>
              <Radio label="Position" value={"Position"}/>
            </RadioGroup>
          </FormGroup>
          <FormGroup className="form-group-quarter"/>
          <FormGroup
            label="Motor Output"
            className="form-group-half"
          >
            <Slider initialValue={output} disabled={!connected} value={output} min={-1.0} max={1.0} stepSize={0.01} onChange={this.changeOutput} />
          </FormGroup>
          <FormGroup
            className="form-group-quarter"
          >
            <Button className="rev-btn" disabled={!connected} onClick={running ? this.stop : this.run}>{running ? "Stop" : "Run"}</Button>
          </FormGroup>
        </div>
      </div>
    );
  }

  public updateGraph(event: any, error: any, response: any) {
    // this.state.option.series.data.push(0.1);
    this.forceUpdate();
  }

  public run() {
    this.setState({running: true});
    // enableHeartbeat(20);
  }

  public stop() {
    this.setState({running: false});
    // disableHeartbeat();
  }

  public changeMode(value: any) {
    this.setState({
      mode: value.currentTarget.value,
      option: {
        series: [{
          data: [],
          type: 'line'
        }],
        xAxis: {
          name: "Time",
          type: 'category'
        },
        yAxis: {
          name: value.currentTarget.value,
          type: 'value'
        }
      }
    });
  }

  public changeOutput(value: number) {
    if (Math.abs(this.state.output - value) > 0.1) {
      if (this.state.output - value < 0) {
        value = this.state.output + 0.1;
      } else {
        value = this.state.output - 0.1;
      }
    }
    this.setState({output: value});
    if (value < 0) {
      // setSetpoint(value * 1024);
    } else {
      // setSetpoint(value * 1023);
    }
  }

  private listenForEmergencyStop(event: any) {
    if (this.state.running) {
      if (event.key === "Space" || event.key === "Enter") {
        console.log("Emergency stop was pressed.");
        this.setState({running: false});
      }
    }
  }
}

export function mapStateToProps(state: IApplicationState) {
  return {
    connected: state.isConnected
  };
}

export default connect(mapStateToProps)(RunTab);