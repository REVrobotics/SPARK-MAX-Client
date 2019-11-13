import {AbstractResource} from "./AbstractResource";
import {
  TelemetryStreamCommand,
  TelemetryStreamRequestDto,
  telemetryStreamRequestFromDto,
  telemetryStreamResponseToDto
} from "../../proto-gen";
import * as grpc from "grpc";
import {logger} from "../loggers";

/**
 * Resource used to manage telemetry stream and emit telemetry events.
 */
export class TelemetryResource extends AbstractResource {
  private signals: Array<{deviceId: string, signalId: number}> = [];

  constructor(private stream: grpc.ClientDuplexStream<any, any>,
              private listener: (event: any) => void) {
    super("");
    console.log("[TELEMETRY] created new stream");
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
      console.log("[TELEMETRY] receive data: %j", dto);
      this.listener({
        type: "data",
        data: dto.data,
      });
    });
    this.stream.on("error", (error) => {
      console.error("[TELEMETRY] error: %j", error);
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
      console.log("[TELEMETRY] stream stopped");

      this.listener({
        type: "stop",
      });

      resolve();
    }));
  }

  private _write(request: TelemetryStreamRequestDto): void {
    console.log("[TELEMETRY] send command: %j", request);
    this.stream.write(telemetryStreamRequestFromDto(request));
  }
}

export const telemetryResourceFactory = (stream: grpc.ClientDuplexStream<any, any>,
                                         listener: (event: any) => void) =>
  new TelemetryResource(stream, listener);
