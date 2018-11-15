interface ISerializable {
  toJSON(): object,
  fromJSON(json: any): ISerializable
}