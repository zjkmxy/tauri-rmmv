import { Window_Command } from '../windows/Window_Command';

export class Window_AsyncCommand<Key extends string> extends Window_Command<Key> {
  protected _promise: Promise<void> | null = null;
}
