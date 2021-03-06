export default class CANScanDetail {
    private _interface: string;
    private _name: string;
    private _firmware: string;
    private _selected: boolean;
    private _updateable: boolean;
  
    constructor(intf: string, name: string, firmware: string, updateable: boolean) {
      this._interface = intf;
      this._name = name;
      this._firmware = firmware;
      this._selected = false;
      this._updateable = updateable;
    }
  
    get interface(): string {
      return this._interface;
    }
  
    set interface(value: string) {
      this._interface = value;
    }
  
    get name(): string {
      return this._name;
    }
  
    set name(value: string) {
      this._name = value;
    }
  
    get firmware(): string {
      return this._firmware;
    }
  
    set firmware(value: string) {
      this._firmware = value;
    }
  
    get selected(): boolean {
      return this._selected;
    }
  
    set selected(value: boolean) {
      this._selected = value;
    }
  
    get updateable(): boolean {
      return this._updateable;
    }
  
    set updateable(value: boolean) {
      this._updateable = value;
    }

  }