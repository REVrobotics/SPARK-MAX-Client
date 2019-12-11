import {validateConfigurationFormat} from "./device-config-validator";

describe("Validation of device configuration", () => {
  it("should return error if root error exists", () => {
    expect(validateConfigurationFormat({
      name: "empty",
      fileName: "empty",
      parameters: [],
      error: "abc",
    } as any)).toHaveLength(1);
  });

  it("should return no errors for empty and valid device configuration", () => {
    expect(validateConfigurationFormat({
      name: "empty",
      fileName: "empty",
      parameters: [],
    } as any)).toHaveLength(0);
  });

  it("should return error if name field has wrong type", () => {
    expect(validateConfigurationFormat({
      name: 1,
      fileName: "empty",
      parameters: [],
    } as any)).toHaveLength(1);
  });

  it("should return error if name or parameters field is missing", () => {
    expect(validateConfigurationFormat({
      fileName: "empty",
      parameters: [],
    } as any)).toHaveLength(1);

    expect(validateConfigurationFormat({
      name: "empty",
      fileName: "empty",
    } as any)).toHaveLength(1);

    expect(validateConfigurationFormat({
      fileName: "empty",
    } as any)).toHaveLength(2);
  });

  it("should return error if parameters field has wrong type", () => {
    expect(validateConfigurationFormat({
      name: "empty",
      fileName: "empty",
      parameters: 2,
    } as any)).toHaveLength(1);
  });

  it("should accumulate errors", () => {
    expect(validateConfigurationFormat({
      name: 1,
      fileName: "empty",
      parameters: 2,
    } as any)).toHaveLength(2);
  });

  it("should return error if element of parameters array has wrong type", () => {
    expect(validateConfigurationFormat({
      name: "some",
      fileName: "some",
      parameters: [2],
    } as any)).toHaveLength(1);
  });

  it("should return error if parameters.id field has wrong type", () => {
    expect(validateConfigurationFormat({
      name: "some",
      fileName: "some",
      parameters: [{id: 2, name: "abc", value: 2}],
    } as any)).toHaveLength(2);
  });

  it("should return error if parameters.id field has not-allowed string value", () => {
    expect(validateConfigurationFormat({
      name: "some",
      fileName: "some",
      parameters: [{id: "kNotExistingParameter", name: "abc", value: 2}],
    } as any)).toHaveLength(1);
  });

  it("should return error if parameters.id field equals to 'kCanId'", () => {
    expect(validateConfigurationFormat({
      name: "some",
      fileName: "some",
      parameters: [{id: "kCanID", name: "CAN ID", value: 2}],
    } as any)).toHaveLength(1);
  });

  it("should return error if parameters.name field has wrong type", () => {
    expect(validateConfigurationFormat({
      name: "some",
      fileName: "some",
      parameters: [{id: "kIdleMode", name: 32, value: 2}],
    } as any)).toHaveLength(1);
  });

  it("should return error if parameters.value field has wrong type", () => {
    expect(validateConfigurationFormat({
      name: "some",
      fileName: "some",
      parameters: [{id: "kIdleMode", name: "Idle Mode", value: "sfsdf"}],
    } as any)).toHaveLength(1);
  });

  it("should return error if one of required parameters[x] field is missing", () => {
    expect(validateConfigurationFormat({
      name: "some",
      fileName: "some",
      parameters: [{name: "Idle Mode", value: 1}],
    } as any)).toHaveLength(1);

    expect(validateConfigurationFormat({
      name: "some",
      fileName: "some",
      parameters: [{id: "kIdleMode", name: "Idle Mode"}],
    } as any)).toHaveLength(1);

    expect(validateConfigurationFormat({
      name: "some",
      fileName: "some",
      parameters: [{name: "Idle Mode"}],
    } as any)).toHaveLength(2);
  });

  it("should not require parameters.name field to be specified", () => {
    expect(validateConfigurationFormat({
      name: "some",
      fileName: "some",
      parameters: [{id: "kIdleMode", value: 1}],
    } as any)).toHaveLength(0);
  });
});
