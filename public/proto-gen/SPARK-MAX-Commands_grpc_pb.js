// GENERATED CODE -- DO NOT EDIT!

// Original file comments:
// Copyright © 2018 REV Robotics LLC (support@revrobotics.com)
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
'use strict';
var grpc = require('grpc');
var SPARK$MAX$Commands_pb = require('./SPARK-MAX-Commands_pb.js');
var SPARK$MAX$Types_pb = require('./SPARK-MAX-Types_pb.js');

function serialize_sparkmax_DRVStatusRequest(arg) {
  if (!(arg instanceof SPARK$MAX$Commands_pb.DRVStatusRequest)) {
    throw new Error('Expected argument of type sparkmax.DRVStatusRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_sparkmax_DRVStatusRequest(buffer_arg) {
  return SPARK$MAX$Commands_pb.DRVStatusRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_sparkmax_DRVStatusResponse(arg) {
  if (!(arg instanceof SPARK$MAX$Commands_pb.DRVStatusResponse)) {
    throw new Error('Expected argument of type sparkmax.DRVStatusResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_sparkmax_DRVStatusResponse(buffer_arg) {
  return SPARK$MAX$Commands_pb.DRVStatusResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_sparkmax_burnRequest(arg) {
  if (!(arg instanceof SPARK$MAX$Commands_pb.burnRequest)) {
    throw new Error('Expected argument of type sparkmax.burnRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_sparkmax_burnRequest(buffer_arg) {
  return SPARK$MAX$Commands_pb.burnRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_sparkmax_burnResponse(arg) {
  if (!(arg instanceof SPARK$MAX$Commands_pb.burnResponse)) {
    throw new Error('Expected argument of type sparkmax.burnResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_sparkmax_burnResponse(buffer_arg) {
  return SPARK$MAX$Commands_pb.burnResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_sparkmax_clearFaultsRequest(arg) {
  if (!(arg instanceof SPARK$MAX$Commands_pb.clearFaultsRequest)) {
    throw new Error('Expected argument of type sparkmax.clearFaultsRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_sparkmax_clearFaultsRequest(buffer_arg) {
  return SPARK$MAX$Commands_pb.clearFaultsRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_sparkmax_clearFaultsResponse(arg) {
  if (!(arg instanceof SPARK$MAX$Commands_pb.clearFaultsResponse)) {
    throw new Error('Expected argument of type sparkmax.clearFaultsResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_sparkmax_clearFaultsResponse(buffer_arg) {
  return SPARK$MAX$Commands_pb.clearFaultsResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_sparkmax_connectRequest(arg) {
  if (!(arg instanceof SPARK$MAX$Commands_pb.connectRequest)) {
    throw new Error('Expected argument of type sparkmax.connectRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_sparkmax_connectRequest(buffer_arg) {
  return SPARK$MAX$Commands_pb.connectRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_sparkmax_connectResponse(arg) {
  if (!(arg instanceof SPARK$MAX$Commands_pb.connectResponse)) {
    throw new Error('Expected argument of type sparkmax.connectResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_sparkmax_connectResponse(buffer_arg) {
  return SPARK$MAX$Commands_pb.connectResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_sparkmax_disconnectRequest(arg) {
  if (!(arg instanceof SPARK$MAX$Commands_pb.disconnectRequest)) {
    throw new Error('Expected argument of type sparkmax.disconnectRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_sparkmax_disconnectRequest(buffer_arg) {
  return SPARK$MAX$Commands_pb.disconnectRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_sparkmax_disconnectResponse(arg) {
  if (!(arg instanceof SPARK$MAX$Commands_pb.disconnectResponse)) {
    throw new Error('Expected argument of type sparkmax.disconnectResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_sparkmax_disconnectResponse(buffer_arg) {
  return SPARK$MAX$Commands_pb.disconnectResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_sparkmax_factoryResetRequest(arg) {
  if (!(arg instanceof SPARK$MAX$Commands_pb.factoryResetRequest)) {
    throw new Error('Expected argument of type sparkmax.factoryResetRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_sparkmax_factoryResetRequest(buffer_arg) {
  return SPARK$MAX$Commands_pb.factoryResetRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_sparkmax_firmwareRequest(arg) {
  if (!(arg instanceof SPARK$MAX$Commands_pb.firmwareRequest)) {
    throw new Error('Expected argument of type sparkmax.firmwareRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_sparkmax_firmwareRequest(buffer_arg) {
  return SPARK$MAX$Commands_pb.firmwareRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_sparkmax_firmwareResponse(arg) {
  if (!(arg instanceof SPARK$MAX$Commands_pb.firmwareResponse)) {
    throw new Error('Expected argument of type sparkmax.firmwareResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_sparkmax_firmwareResponse(buffer_arg) {
  return SPARK$MAX$Commands_pb.firmwareResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_sparkmax_followerRequest(arg) {
  if (!(arg instanceof SPARK$MAX$Commands_pb.followerRequest)) {
    throw new Error('Expected argument of type sparkmax.followerRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_sparkmax_followerRequest(buffer_arg) {
  return SPARK$MAX$Commands_pb.followerRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_sparkmax_getParameterRequest(arg) {
  if (!(arg instanceof SPARK$MAX$Commands_pb.getParameterRequest)) {
    throw new Error('Expected argument of type sparkmax.getParameterRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_sparkmax_getParameterRequest(buffer_arg) {
  return SPARK$MAX$Commands_pb.getParameterRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_sparkmax_idAssignmentRequest(arg) {
  if (!(arg instanceof SPARK$MAX$Commands_pb.idAssignmentRequest)) {
    throw new Error('Expected argument of type sparkmax.idAssignmentRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_sparkmax_idAssignmentRequest(buffer_arg) {
  return SPARK$MAX$Commands_pb.idAssignmentRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_sparkmax_identifyRequest(arg) {
  if (!(arg instanceof SPARK$MAX$Commands_pb.identifyRequest)) {
    throw new Error('Expected argument of type sparkmax.identifyRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_sparkmax_identifyRequest(buffer_arg) {
  return SPARK$MAX$Commands_pb.identifyRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_sparkmax_listRequest(arg) {
  if (!(arg instanceof SPARK$MAX$Commands_pb.listRequest)) {
    throw new Error('Expected argument of type sparkmax.listRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_sparkmax_listRequest(buffer_arg) {
  return SPARK$MAX$Commands_pb.listRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_sparkmax_listResponse(arg) {
  if (!(arg instanceof SPARK$MAX$Commands_pb.listResponse)) {
    throw new Error('Expected argument of type sparkmax.listResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_sparkmax_listResponse(buffer_arg) {
  return SPARK$MAX$Commands_pb.listResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_sparkmax_parameterListRequest(arg) {
  if (!(arg instanceof SPARK$MAX$Commands_pb.parameterListRequest)) {
    throw new Error('Expected argument of type sparkmax.parameterListRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_sparkmax_parameterListRequest(buffer_arg) {
  return SPARK$MAX$Commands_pb.parameterListRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_sparkmax_parameterListResponse(arg) {
  if (!(arg instanceof SPARK$MAX$Commands_pb.parameterListResponse)) {
    throw new Error('Expected argument of type sparkmax.parameterListResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_sparkmax_parameterListResponse(buffer_arg) {
  return SPARK$MAX$Commands_pb.parameterListResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_sparkmax_parameterResponse(arg) {
  if (!(arg instanceof SPARK$MAX$Commands_pb.parameterResponse)) {
    throw new Error('Expected argument of type sparkmax.parameterResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_sparkmax_parameterResponse(buffer_arg) {
  return SPARK$MAX$Commands_pb.parameterResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_sparkmax_pingRequest(arg) {
  if (!(arg instanceof SPARK$MAX$Commands_pb.pingRequest)) {
    throw new Error('Expected argument of type sparkmax.pingRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_sparkmax_pingRequest(buffer_arg) {
  return SPARK$MAX$Commands_pb.pingRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_sparkmax_pingResponse(arg) {
  if (!(arg instanceof SPARK$MAX$Commands_pb.pingResponse)) {
    throw new Error('Expected argument of type sparkmax.pingResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_sparkmax_pingResponse(buffer_arg) {
  return SPARK$MAX$Commands_pb.pingResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_sparkmax_rootResponse(arg) {
  if (!(arg instanceof SPARK$MAX$Commands_pb.rootResponse)) {
    throw new Error('Expected argument of type sparkmax.rootResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_sparkmax_rootResponse(buffer_arg) {
  return SPARK$MAX$Commands_pb.rootResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_sparkmax_setParameterRequest(arg) {
  if (!(arg instanceof SPARK$MAX$Commands_pb.setParameterRequest)) {
    throw new Error('Expected argument of type sparkmax.setParameterRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_sparkmax_setParameterRequest(buffer_arg) {
  return SPARK$MAX$Commands_pb.setParameterRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_sparkmax_setpointRequest(arg) {
  if (!(arg instanceof SPARK$MAX$Commands_pb.setpointRequest)) {
    throw new Error('Expected argument of type sparkmax.setpointRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_sparkmax_setpointRequest(buffer_arg) {
  return SPARK$MAX$Commands_pb.setpointRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_sparkmax_setpointResponse(arg) {
  if (!(arg instanceof SPARK$MAX$Commands_pb.setpointResponse)) {
    throw new Error('Expected argument of type sparkmax.setpointResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_sparkmax_setpointResponse(buffer_arg) {
  return SPARK$MAX$Commands_pb.setpointResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_sparkmax_telemetryRequest(arg) {
  if (!(arg instanceof SPARK$MAX$Commands_pb.telemetryRequest)) {
    throw new Error('Expected argument of type sparkmax.telemetryRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_sparkmax_telemetryRequest(buffer_arg) {
  return SPARK$MAX$Commands_pb.telemetryRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_sparkmax_telemetryResponse(arg) {
  if (!(arg instanceof SPARK$MAX$Commands_pb.telemetryResponse)) {
    throw new Error('Expected argument of type sparkmax.telemetryResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_sparkmax_telemetryResponse(buffer_arg) {
  return SPARK$MAX$Commands_pb.telemetryResponse.deserializeBinary(new Uint8Array(buffer_arg));
}


// Interface functions for service sparkmax.
// All command requests are serialized into a 
// RequestWire type before transmission, and
// Deserializezd to a ResponseWire on recipt
var sparkMaxServerService = exports.sparkMaxServerService = {
  //
  // Connect to the requested USB to CAN device.
  connect: {
    path: '/sparkmax.sparkMaxServer/Connect',
    requestStream: false,
    responseStream: false,
    requestType: SPARK$MAX$Commands_pb.connectRequest,
    responseType: SPARK$MAX$Commands_pb.connectResponse,
    requestSerialize: serialize_sparkmax_connectRequest,
    requestDeserialize: deserialize_sparkmax_connectRequest,
    responseSerialize: serialize_sparkmax_connectResponse,
    responseDeserialize: deserialize_sparkmax_connectResponse,
  },
  //
  // Disconnect from the USB to CAN device
  disconnect: {
    path: '/sparkmax.sparkMaxServer/Disconnect',
    requestStream: false,
    responseStream: false,
    requestType: SPARK$MAX$Commands_pb.disconnectRequest,
    responseType: SPARK$MAX$Commands_pb.disconnectResponse,
    requestSerialize: serialize_sparkmax_disconnectRequest,
    requestDeserialize: deserialize_sparkmax_disconnectRequest,
    responseSerialize: serialize_sparkmax_disconnectResponse,
    responseDeserialize: deserialize_sparkmax_disconnectResponse,
  },
  //
  // Ping the SPARK to verify connection to the hardware and to
  // this server.
  ping: {
    path: '/sparkmax.sparkMaxServer/Ping',
    requestStream: false,
    responseStream: false,
    requestType: SPARK$MAX$Commands_pb.pingRequest,
    responseType: SPARK$MAX$Commands_pb.pingResponse,
    requestSerialize: serialize_sparkmax_pingRequest,
    requestDeserialize: deserialize_sparkmax_pingRequest,
    responseSerialize: serialize_sparkmax_pingResponse,
    responseDeserialize: deserialize_sparkmax_pingResponse,
  },
  //
  // List the all connected SPARK devices. If already connected
  // to a USB to CAN device, this will list all devices on the
  // CAN bus, otherwise, this will list all available USB to CAN
  // bridge devices.
  list: {
    path: '/sparkmax.sparkMaxServer/List',
    requestStream: false,
    responseStream: false,
    requestType: SPARK$MAX$Commands_pb.listRequest,
    responseType: SPARK$MAX$Commands_pb.listResponse,
    requestSerialize: serialize_sparkmax_listRequest,
    requestDeserialize: deserialize_sparkmax_listRequest,
    responseSerialize: serialize_sparkmax_listResponse,
    responseDeserialize: deserialize_sparkmax_listResponse,
  },
  //
  // Retrieve or update the firmware of the device(s)
  firmware: {
    path: '/sparkmax.sparkMaxServer/Firmware',
    requestStream: false,
    responseStream: false,
    requestType: SPARK$MAX$Commands_pb.firmwareRequest,
    responseType: SPARK$MAX$Commands_pb.firmwareResponse,
    requestSerialize: serialize_sparkmax_firmwareRequest,
    requestDeserialize: deserialize_sparkmax_firmwareRequest,
    responseSerialize: serialize_sparkmax_firmwareResponse,
    responseDeserialize: deserialize_sparkmax_firmwareResponse,
  },
  //
  // Retrieve or update the firmware of the device(s)
  firmwareRecover: {
    path: '/sparkmax.sparkMaxServer/FirmwareRecover',
    requestStream: false,
    responseStream: false,
    requestType: SPARK$MAX$Commands_pb.firmwareRequest,
    responseType: SPARK$MAX$Commands_pb.firmwareResponse,
    requestSerialize: serialize_sparkmax_firmwareRequest,
    requestDeserialize: deserialize_sparkmax_firmwareRequest,
    responseSerialize: serialize_sparkmax_firmwareResponse,
    responseDeserialize: deserialize_sparkmax_firmwareResponse,
  },
  //
  // Set a device parameter. The parameter should be configParam type
  // the value is a string in both the request and response.
  setParameter: {
    path: '/sparkmax.sparkMaxServer/SetParameter',
    requestStream: false,
    responseStream: false,
    requestType: SPARK$MAX$Commands_pb.setParameterRequest,
    responseType: SPARK$MAX$Commands_pb.parameterResponse,
    requestSerialize: serialize_sparkmax_setParameterRequest,
    requestDeserialize: deserialize_sparkmax_setParameterRequest,
    responseSerialize: serialize_sparkmax_parameterResponse,
    responseDeserialize: deserialize_sparkmax_parameterResponse,
  },
  //
  // Get a device parameter. The parameter should be configParam type
  // the value returned is a string in both the request and response.
  // The requested value type is also passed to help decode. The type
  // is of type paramType
  getParameter: {
    path: '/sparkmax.sparkMaxServer/GetParameter',
    requestStream: false,
    responseStream: false,
    requestType: SPARK$MAX$Commands_pb.getParameterRequest,
    responseType: SPARK$MAX$Commands_pb.parameterResponse,
    requestSerialize: serialize_sparkmax_getParameterRequest,
    requestDeserialize: deserialize_sparkmax_getParameterRequest,
    responseSerialize: serialize_sparkmax_parameterResponse,
    responseDeserialize: deserialize_sparkmax_parameterResponse,
  },
  //
  // Make all configuration changes permanent for the next time the 
  // device powers on. Note: This writes any values that have changed
  // and can only be called when the device is not enabled. Since this
  // method writes directly to FLASH, avoid calling frequently, as each
  // flash location can be written to a total of 10,000 times in its lifetime.
  // Flash wear leveling is being implemented and should be in the release
  // before kickoff
  burnFlash: {
    path: '/sparkmax.sparkMaxServer/BurnFlash',
    requestStream: false,
    responseStream: false,
    requestType: SPARK$MAX$Commands_pb.burnRequest,
    responseType: SPARK$MAX$Commands_pb.burnResponse,
    requestSerialize: serialize_sparkmax_burnRequest,
    requestDeserialize: deserialize_sparkmax_burnRequest,
    responseSerialize: serialize_sparkmax_burnResponse,
    responseDeserialize: deserialize_sparkmax_burnResponse,
  },
  //
  // Return a list of all parameters, equivilant to calling GetParamter for all
  // parameters of the device.
  listParameters: {
    path: '/sparkmax.sparkMaxServer/ListParameters',
    requestStream: false,
    responseStream: false,
    requestType: SPARK$MAX$Commands_pb.parameterListRequest,
    responseType: SPARK$MAX$Commands_pb.parameterListResponse,
    requestSerialize: serialize_sparkmax_parameterListRequest,
    requestDeserialize: deserialize_sparkmax_parameterListRequest,
    responseSerialize: serialize_sparkmax_parameterListResponse,
    responseDeserialize: deserialize_sparkmax_parameterListResponse,
  },
  //
  // Send a setpoint command. The value should be native units depending
  // on the curernt control mode (+/- 1.0 for duty cycle control)
  // Setting Enable = true will also send a heartbeat allowing the controller
  // drive the motor.
  setpoint: {
    path: '/sparkmax.sparkMaxServer/Setpoint',
    requestStream: false,
    responseStream: false,
    requestType: SPARK$MAX$Commands_pb.setpointRequest,
    responseType: SPARK$MAX$Commands_pb.setpointResponse,
    requestSerialize: serialize_sparkmax_setpointRequest,
    requestDeserialize: deserialize_sparkmax_setpointRequest,
    responseSerialize: serialize_sparkmax_setpointResponse,
    responseDeserialize: deserialize_sparkmax_setpointResponse,
  },
  //
  // Set controller to follow another controller.
  follow: {
    path: '/sparkmax.sparkMaxServer/Follow',
    requestStream: false,
    responseStream: false,
    requestType: SPARK$MAX$Commands_pb.followerRequest,
    responseType: SPARK$MAX$Commands_pb.rootResponse,
    requestSerialize: serialize_sparkmax_followerRequest,
    requestDeserialize: deserialize_sparkmax_followerRequest,
    responseSerialize: serialize_sparkmax_rootResponse,
    responseDeserialize: deserialize_sparkmax_rootResponse,
  },
  //
  // Clear all sticky faults and DRV faults
  clearFaults: {
    path: '/sparkmax.sparkMaxServer/ClearFaults',
    requestStream: false,
    responseStream: false,
    requestType: SPARK$MAX$Commands_pb.clearFaultsRequest,
    responseType: SPARK$MAX$Commands_pb.clearFaultsResponse,
    requestSerialize: serialize_sparkmax_clearFaultsRequest,
    requestDeserialize: deserialize_sparkmax_clearFaultsRequest,
    responseSerialize: serialize_sparkmax_clearFaultsResponse,
    responseDeserialize: deserialize_sparkmax_clearFaultsResponse,
  },
  //
  // Get the faults, sticky faults, and status of the DRV8320 device.
  dRVStatus: {
    path: '/sparkmax.sparkMaxServer/DRVStatus',
    requestStream: false,
    responseStream: false,
    requestType: SPARK$MAX$Commands_pb.DRVStatusRequest,
    responseType: SPARK$MAX$Commands_pb.DRVStatusResponse,
    requestSerialize: serialize_sparkmax_DRVStatusRequest,
    requestDeserialize: deserialize_sparkmax_DRVStatusRequest,
    responseSerialize: serialize_sparkmax_DRVStatusResponse,
    responseDeserialize: deserialize_sparkmax_DRVStatusResponse,
  },
  //
  // Set or get telemetry related data
  telemetry: {
    path: '/sparkmax.sparkMaxServer/Telemetry',
    requestStream: false,
    responseStream: false,
    requestType: SPARK$MAX$Commands_pb.telemetryRequest,
    responseType: SPARK$MAX$Commands_pb.telemetryResponse,
    requestSerialize: serialize_sparkmax_telemetryRequest,
    requestDeserialize: deserialize_sparkmax_telemetryRequest,
    responseSerialize: serialize_sparkmax_telemetryResponse,
    responseDeserialize: deserialize_sparkmax_telemetryResponse,
  },
  //
  // Reset the controller to factory defaults
  factoryReset: {
    path: '/sparkmax.sparkMaxServer/FactoryReset',
    requestStream: false,
    responseStream: false,
    requestType: SPARK$MAX$Commands_pb.factoryResetRequest,
    responseType: SPARK$MAX$Commands_pb.rootResponse,
    requestSerialize: serialize_sparkmax_factoryResetRequest,
    requestDeserialize: deserialize_sparkmax_factoryResetRequest,
    responseSerialize: serialize_sparkmax_rootResponse,
    responseDeserialize: deserialize_sparkmax_rootResponse,
  },
  //
  // Sets the ID assignment of a controller
  iDAssignment: {
    path: '/sparkmax.sparkMaxServer/IDAssignment',
    requestStream: false,
    responseStream: false,
    requestType: SPARK$MAX$Commands_pb.idAssignmentRequest,
    responseType: SPARK$MAX$Commands_pb.rootResponse,
    requestSerialize: serialize_sparkmax_idAssignmentRequest,
    requestDeserialize: deserialize_sparkmax_idAssignmentRequest,
    responseSerialize: serialize_sparkmax_rootResponse,
    responseDeserialize: deserialize_sparkmax_rootResponse,
  },
  //
  // Identifies devices (via a flashing blink code) based on a unique id or can id
  identify: {
    path: '/sparkmax.sparkMaxServer/Identify',
    requestStream: false,
    responseStream: false,
    requestType: SPARK$MAX$Commands_pb.identifyRequest,
    responseType: SPARK$MAX$Commands_pb.rootResponse,
    requestSerialize: serialize_sparkmax_identifyRequest,
    requestDeserialize: deserialize_sparkmax_identifyRequest,
    responseSerialize: serialize_sparkmax_rootResponse,
    responseDeserialize: deserialize_sparkmax_rootResponse,
  },
};

exports.sparkMaxServerClient = grpc.makeGenericClientConstructor(sparkMaxServerService);
