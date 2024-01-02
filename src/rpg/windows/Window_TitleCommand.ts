//-----------------------------------------------------------------------------
// Window_TitleCommand
//
// The window for selecting New Game/Continue on the title screen.

import { Window_Command } from './Window_Command';
import * as Graphics from '../core/Graphics';

export type TitleCommandKey = 'newGame' | 'continue' | 'options';

/** The window for selecting New Game/Continue on the title screen. */
export class Window_TitleCommand extends Window_Command<TitleCommandKey> {
  protected static _lastCommandSymbol: TitleCommandKey | undefined;

  public static initCommandPosition() {
    Window_TitleCommand._lastCommandSymbol = undefined;
  }

  constructor() {
    super(0, 0);
    this.updatePlacement();
    this.openness = 0;
    this.selectLast();
  }

  public windowWidth() {
    return 240;
  }

  public updatePlacement() {
    this.x = (Graphics.default.boxWidth - this.width) / 2;
    this.y = Graphics.default.boxHeight - this.height - 96;
  }

  public makeCommandList() {
    // TODO: TextManager
    // this.addCommand(TextManager.newGame, 'newGame');
    // this.addCommand(TextManager.continue_, 'continue', this.isContinueEnabled());
    // this.addCommand(TextManager.options, 'options');
    this.addCommand('NEW GAME', 'newGame');
    this.addCommand('CONTINUE', 'continue', this.isContinueEnabled());
    this.addCommand('OPTIONS', 'options');
  }

  public isContinueEnabled() {
    // TODO: DataManager
    // return DataManager.isAnySavefileExists();
    return false;
  }

  public processOk() {
    Window_TitleCommand._lastCommandSymbol = this.currentSymbol();
    super.processOk();
  }

  public selectLast() {
    if (Window_TitleCommand._lastCommandSymbol) {
      this.selectSymbol(Window_TitleCommand._lastCommandSymbol);
    } else if (this.isContinueEnabled()) {
      this.selectSymbol('continue');
    }
  }
}
