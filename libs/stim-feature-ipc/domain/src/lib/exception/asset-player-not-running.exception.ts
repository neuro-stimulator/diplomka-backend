import { MessageCodes } from '@stechy1/diplomka-share';

import { BaseError } from '@diplomka-backend/stim-lib-common';

export class AssetPlayerNotRunningException extends BaseError {
  public readonly errorCode = MessageCodes.CODE_ERROR_IPC_PLAYER_NOT_RUNNING;
}
