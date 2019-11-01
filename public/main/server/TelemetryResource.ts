import {AbstractResource} from "./AbstractResource";
import {
  TelemetryStreamCommand,
  TelemetryStreamRequestDto,
  telemetryStreamRequestFromDto,
  telemetryStreamResponseToDto
} from "../../proto-gen";
import * as grpc from "grpc";
import {logger} from "../loggers";

export class TelemetryResource extends AbstractResource {
  private signals: Array<{deviceId: string, signalId: number}> = [];

  constructor(private stream: grpc.ClientDuplexStream<any, any>,
              private listener: (event: any) => void) {
    super("");
  }

  public addSignal(device: string, signalId: number) {
    this._write({
      command: TelemetryStreamCommand.StreamAddSignal,
      config: {
        root: {device},
        id: signalId,
      },
    });
    this.signals.push({deviceId: device, signalId});
  }

  public removeSignal(device: string, signalId: number) {
    this._write({
      command: TelemetryStreamCommand.StreamRemoveSignal,
      config: {
        root: {device},
        id: signalId,
      },
    });
    this.signals.push({deviceId: device, signalId});
  }

  public getSignals() {
    return this.signals;
  }

  protected _start(): void {
    this.stream.on("data", (msg) => {
      const dto = telemetryStreamResponseToDto(msg);
      this.listener({
        type: "data",
        data: dto.data,
      });
    });
    this.stream.on("error", (error) => {
      this.listener({
        type: "data",
        error,
      });
      logger.error("Error during telemetry streaming", error);
    });

    this._write({
      command: TelemetryStreamCommand.StreamStart,
    });

    this.listener({
      type: "start",
    });
  }

  protected _stop(): Promise<void> {
    this._write({
      command: TelemetryStreamCommand.StreamStop,
    });

    return new Promise((resolve) => this.stream.end(() => {
      this.listener({
        type: "stop",
      });

      resolve();
    }));
  }

  private _write(request: TelemetryStreamRequestDto): void {
    this.stream.write(telemetryStreamRequestFromDto(request));
  }
}

export const telemetryResourceFactory = (stream: grpc.ClientDuplexStream<any, any>,
                                         listener: (event: any) => void) =>
  new TelemetryResource(stream, listener);
