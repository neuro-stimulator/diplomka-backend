import { MessageCodes } from '@stechy1/diplomka-share';

import { BaseError } from '@neuro-server/stim-lib-common';

export class UserNotFoundException extends BaseError {
  public readonly errorCode = MessageCodes.CODE_ERROR_USER_NOT_FOUND;
}
