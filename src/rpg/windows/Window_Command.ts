//-----------------------------------------------------------------------------
// Window_Command
//
// The superclass of windows for selecting a command.

import { Window_Selectable } from './Window_Selectable';

export type CommandItem<Key extends string, Ext> = {
  name: string;
  symbol: Key;
  enabled: boolean;
  ext?: Ext;
};

/** The superclass of windows for selecting a command. */
export class Window_Command<Key extends string, Ext = never> extends Window_Selectable<Key> {
  protected _list: Array<CommandItem<Key, Ext>> = [];

  constructor(x: number, y: number) {
    super();
    this.clearCommandList();
    this.makeCommandList();
    const width = this.windowWidth();
    const height = this.windowHeight();
    this.initialize(x, y, width, height);
    this.refresh();
    this.select(0);
    this.activate();
  }

  public windowWidth() {
    return 240;
  }

  public windowHeight() {
    return this.fittingHeight(this.numVisibleRows());
  }

  public numVisibleRows() {
    return Math.ceil(this.maxItems() / this.maxCols());
  }

  public maxItems() {
    return this._list.length;
  }

  public clearCommandList() {
    this._list = [];
  }

  public makeCommandList() {}

  public addCommand(name: string, symbol: Key, enabled: boolean = true, ext?: Ext) {
    this._list.push({ name, symbol, enabled, ext });
  }

  public commandName(index: number) {
    return this._list[index].name;
  }

  public commandSymbol(index: number) {
    return this._list[index].symbol;
  }

  public isCommandEnabled(index: number) {
    return this._list[index].enabled;
  }

  public currentData() {
    return this.index() >= 0 ? this._list[this.index()] : null;
  }

  public isCurrentItemEnabled() {
    return this.currentData()?.enabled ?? false;
  }

  public currentSymbol() {
    return this.currentData()?.symbol;
  }

  public currentExt() {
    return this.currentData()?.ext;
  }

  public findSymbol(symbol: string) {
    for (let i = 0; i < this._list.length; i++) {
      if (this._list[i].symbol === symbol) {
        return i;
      }
    }
    return -1;
  }

  public selectSymbol(symbol: string) {
    const index = this.findSymbol(symbol);
    if (index >= 0) {
      this.select(index);
    } else {
      this.select(0);
    }
  }

  public findExt(ext: Ext) {
    for (let i = 0; i < this._list.length; i++) {
      if (this._list[i].ext === ext) {
        return i;
      }
    }
    return -1;
  }

  public selectExt(ext: Ext) {
    const index = this.findExt(ext);
    if (index >= 0) {
      this.select(index);
    } else {
      this.select(0);
    }
  }

  public drawItem(index: number) {
    const rect = this.itemRectForText(index);
    const align = this.itemTextAlign();
    this.resetTextColor();
    this.changePaintOpacity(this.isCommandEnabled(index));
    this.drawText(this.commandName(index), rect.x, rect.y, rect.width, align);
  }

  public itemTextAlign(): CanvasTextAlign {
    return 'left';
  }

  public isOkEnabled() {
    return true;
  }

  public callOkHandler() {
    const symbol = this.currentSymbol();
    if (this.isHandled(symbol)) {
      this.callHandler(symbol);
    } else if (this.isHandled('ok')) {
      super.callOkHandler();
    } else {
      this.activate();
    }
  }

  public refresh() {
    this.clearCommandList();
    this.makeCommandList();
    this.createContents();
    super.refresh();
  }
}
