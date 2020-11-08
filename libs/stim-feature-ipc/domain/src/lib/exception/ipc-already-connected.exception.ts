import { BaseError } from '@diplomka-backend/stim-lib-common';

import { MessageCodes } from '@stechy1/diplomka-share';

export class IpcAlreadyConnectedException extends BaseError {
  public readonly errorCode = MessageCodes.CODE_ERROR_IPC_ALREADY_CONNECTED;
}
