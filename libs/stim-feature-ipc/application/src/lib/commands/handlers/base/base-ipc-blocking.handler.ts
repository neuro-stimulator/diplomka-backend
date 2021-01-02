import { Logger } from '@nestjs/common';
import { EventBus, IEvent } from '@nestjs/cqrs';

import { Settings } from '@stechy1/diplomka-share';

import { BaseBlockingHandler, CommandIdService } from '@diplomka-backend/stim-lib-common';
import { SettingsFacade } from '@diplomka-backend/stim-feature-settings';
import { IpcCommandType, IpcMessage } from '@diplomka-backend/stim-feature-ipc/domain';

import { IpcBlockingCommandFailedEvent } from '../../../event/impl/ipc-blocking-command-failed.event';
import { IpcEvent } from '../../../event/impl/ipc.event';
import { IpcBlockingCommand } from '../../impl/base/ipc-blocking.command';

export abstract class BaseIpcBlockingHandler<TCommand extends IpcBlockingCommand, MType> extends BaseBlockingHandler<TCommand, IpcCommandType, IpcEvent<MType>, IpcMessage<MType>> {
  private _timeOut: number;

  protected constructor(private readonly settings: SettingsFacade, commandIdService: CommandIdService, eventBus: EventBus, logger: Logger) {
    super(commandIdService, eventBus, logger);
  }

  protected async init(command: TCommand): Promise<void> {
    const settings: Settings = await this.settings.getSettings();
    this._timeOut = <number>settings.assetPlayerResponseTimeout;
  }

  protected provideBlockingFailedEvent(commandType: IpcCommandType): IEvent {
    return new IpcBlockingCommandFailedEvent(commandType);
  }

  protected isRequestedEvent(event: IEvent): boolean {
    return event instanceof IpcEvent;
  }

  protected get timeoutValue(): number {
    return this._timeOut;
  }
}
