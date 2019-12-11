
export interface IRawDeviceConfigParamDto {
  id: string;
  name?: string;
  value: number;
}

export interface IRawDeviceConfigDto {
  filePath: string;
  fileName: string;
  name: string;
  parameters: IRawDeviceConfigParamDto[];
  template: boolean;
  error?: string;
}

export const isRawDeviceConfigValid = (config: IRawDeviceConfigDto) => config.error == null;
