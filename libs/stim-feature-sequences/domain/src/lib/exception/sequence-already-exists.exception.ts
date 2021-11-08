import { MessageCodes } from '@stechy1/diplomka-share';

import { BaseError } from '@neuro-server/stim-lib-common';

export class SequenceAlreadyExistsException extends BaseError {
  public readonly errorCode = MessageCodes.CODE_ERROR_SEQUENCE_ALREADY_EXISTS;
}
