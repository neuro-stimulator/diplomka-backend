import { MessageCodes, Sequence } from '@stechy1/diplomka-share';

import { BaseError, QueryError } from '@neuro-server/stim-lib-common';

export class SequenceWasNotCreatedException extends BaseError {
  public readonly errorCode = MessageCodes.CODE_ERROR_SEQUENCE_NOT_CREATED;

  constructor(public readonly sequence: Sequence, public readonly error?: QueryError) {
    super();
  }
}
