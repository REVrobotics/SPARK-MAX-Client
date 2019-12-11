## protoc-dto-plugin

This protoc plugin generates simple representation of proto-buffer messages.

### Motivation

When protoc generates proto-buffer messages it rewrites names of properties and values.
For example,
- name `deviceList` (which is an array of strings) becomes `devicelistList`,
- enum values looses its case, value `kCanId` becomes `KCANID`.

This plugin generates TS interfaces and enums that represent .proto structures in their original form.
Also it can generate mappers to transform protocol-buffer Message(s) to original form and vice versa.

This way, for the following message 

```proto
message listResponse {
    // List of all US   evices
    repeated string deviceList = 1;

    repeated string driverList = 2;

    rootResponse root = 3;

    // List of all devices with more details
    repeated extendedListResponse extendedList = 4;
}
```

`protoc` generates `Message` having the following structure

```
listResponse
    -> root: rootResponse
        -> error: string
    -> devicelistList: string[]
    -> driverlistList: string[]
    -> extendedlistList: extendedListResponse[]
        -> interfacename: string
        -> drivername: string
        -> devicename: string
        -> deviceid: number
        -> updateable: boolean
        -> uniqueid: number
```

`protoc-dto-plugin` generates the following interface

```typescript

export interface ListResponseDto {
  deviceList: string[];
  driverList: string[];
  root?: RootResponseDto;
  extendedList: ExtendedListResponseDto[];
}

export interface RootResponseDto {
  error?: string;
}

export interface ExtendedListResponseDto {
  interfaceName?: string;
  driverName?: string;
  deviceName?: string;
  deviceId?: number;
  updateable?: boolean;
  uniqueId?: number;
}

```

Also `protoc-dto-plugin` can generate functions which transform `Message` to the original form and vice versa.

```typescript
export function listResponseFromDto(dto: ListResponseDto): SPARK_MAX_Commands.listResponse;
export function listResponseToDto(message: SPARK_MAX_Commands.listResponse): ListResponseDto;
```

## How to run

Run the following command to generate TS type definitions
```
protoc
    --plugin=protoc-gen-dto=<path-to-protoc-dto-plugin-executable>
    --dto_out=<path-to-destination-directory>
    some.proto
```

When parameter `withMappers` is provided plugin will also generate transform functions
```
protoc
    --plugin=protoc-gen-dto=<path-to-protoc-dto-plugin-executable>
    --dto_out=withMappers;<path-to-destination-directory>
    some.proto
```