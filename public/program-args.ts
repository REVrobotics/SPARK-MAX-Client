import {argv} from "yargs";

// This options points out if we should use remote SPARK MAX server
export const HEADLESS = argv.headless as boolean;

// Host and port of SPARK MAX server to be connected to
export const HOST: string = argv.host ? argv.host as string : "localhost";
export const PORT: number = argv.port ? argv.port as number : 8001;

// Support of GRPC argument should be removed as soon as support of ZeroMQ communication will be terminated
export const USE_GRPC = argv.grpc as boolean;
