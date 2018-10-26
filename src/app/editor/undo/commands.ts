export class ActionCaller {
  private _actions: Array<Action> = [];
  private _actionToCreate: Action;
  private _maxActionsInQueue = 1000;

  private _actionIndex = 0;

  get size() { return this._actions.length; }

  public undo() {
    if (this._actionIndex <= 0) { this._actionIndex = 0; return; }
    this._actionIndex -= 1;
    this._actions[this._actionIndex].undo();
  }

  public redo() {
    if (this._actionIndex >= this._actions.length) { this._actionIndex = this._actions.length; return; }
    this._actions[this._actionIndex].do();
    this._actionIndex += 1;
  }

  private pushAction(action: Action) {
    this._actions.splice(this._actionIndex, this._actions.length - this._actionIndex);
    this._actions.push(action);
    if (this._actions.length > this._maxActionsInQueue) {
      this._actions.splice(0, this._actions.length - this._maxActionsInQueue);
    }
    this._actionIndex = this._actions.length;
  }


  public startAction(label: string) {
    if (this._actionToCreate) {
      console.error('Action not finalized!');
      this.finishAction();
    }
    this._actionToCreate = new Action(new MultiCommand([]), label);
  }

  public runCommand(command: Command) {
    if (command.isIdendity()) { return; }
    if (!this._actionToCreate) { console.error('No action started yet!'); this.startAction('undefined'); }
    const lastCommand = this._actionToCreate.command as MultiCommand;
    lastCommand.push(command);
    command.do();
  }

  public finishAction(run = false) {
    if (!this._actionToCreate) { console.warn('No action started.'); return; }
    if ((this._actionToCreate.command as MultiCommand).empty) { this._actionToCreate = null; return; }
    this.pushAction(this._actionToCreate);
    if (run) { this._actionToCreate.do(); }  // finish the action!
    this._actionToCreate = null;
  }

  public runAction(label: string, command: Command) {
    const action = new Action(command, label);
    this.pushAction(this._actionToCreate);
    action.do();
  }
}

class Action {
  constructor(
    public command: Command,
    public label: string,
  ) {}

  do() { this.command.do(); }
  undo() { this.command.undo(); }
}

export abstract class Command {
  abstract do(): void;
  abstract undo(): void;
  abstract isIdendity(): boolean;
}

export class MultiCommand {
  constructor(
    private _commands: Array<Command>
  ) {}

  get empty() { return this._commands.length === 0; }

  push(command: Command) { this._commands.push(command); }

  do() { this._commands.forEach(c => c.do()); }
  undo() { this._commands.reverse().forEach(c => c.undo()); }
  isIdendity() { for (const cmd of this._commands) { if (!cmd.isIdendity()) { return false; }} return true; }
}

