import { Test, TestingModule } from '@nestjs/testing';
import { EventBus } from '@nestjs/cqrs';
import DoneCallback = jest.DoneCallback;

import { QueryFailedError } from 'typeorm';

import { createEmptySequence, Sequence } from '@stechy1/diplomka-share';

import { eventBusProvider, MockType } from 'test-helpers/test-helpers';

import { SequenceWasDeletedEvent } from '../../event/impl/sequence-was-deleted.event';
import { SequenceIdNotFoundError } from '../../../domain/exception/sequence-id-not-found.error';
import { SequenceWasNotDeletedError } from '../../../domain/exception/sequence-was-not-deleted.error';
import { SequencesService } from '../../../domain/services/sequences.service';
import { createSequencesServiceMock } from '../../../domain/services/sequences.service.jest';
import { SequenceDeleteCommand } from '../impl/sequence-delete.command';
import { SequenceDeleteHandler } from './sequence-delete.handler';

describe('SequenceDeleteHandler', () => {
  let testingModule: TestingModule;
  let handler: SequenceDeleteHandler;
  let service: MockType<SequencesService>;
  let eventBus: MockType<EventBus>;

  beforeEach(async () => {
    testingModule = await Test.createTestingModule({
      providers: [
        SequenceDeleteHandler,
        {
          provide: SequencesService,
          useFactory: createSequencesServiceMock,
        },
        eventBusProvider,
      ],
    }).compile();

    handler = testingModule.get<SequenceDeleteHandler>(SequenceDeleteHandler);
    // @ts-ignore
    service = testingModule.get<MockType<SequencesService>>(SequencesService);
    // @ts-ignore
    eventBus = testingModule.get<MockType<EventBus>>(EventBus);
  });

  afterEach(() => {
    service.delete.mockClear();
    eventBus.publish.mockClear();
  });

  it('positive - should delete sequence', async () => {
    const sequence: Sequence = createEmptySequence();
    sequence.id = 1;
    const command = new SequenceDeleteCommand(sequence.id);

    service.byId.mockReturnValue(sequence);

    await handler.execute(command);

    expect(service.delete).toBeCalledWith(sequence.id);
    expect(eventBus.publish).toBeCalledWith(new SequenceWasDeletedEvent(sequence));
  });

  it('negative - should throw exception when sequence not found', async (done: DoneCallback) => {
    const sequenceID = -1;
    const command = new SequenceDeleteCommand(sequenceID);

    service.byId.mockImplementation(() => {
      throw new SequenceIdNotFoundError(sequenceID);
    });

    try {
      await handler.execute(command);
      done.fail({ message: 'SequenceIdNotFoundError was not thrown' });
    } catch (e) {
      if (e instanceof SequenceIdNotFoundError) {
        expect(e.sequenceID).toEqual(sequenceID);
        expect(eventBus.publish).not.toBeCalled();
        done();
      } else {
        done.fail('Unknown exception was thrown.');
      }
    }
  });

  it('negative - should throw exception when command failed', async (done: DoneCallback) => {
    const sequenceID = -1;
    const command = new SequenceDeleteCommand(sequenceID);

    service.byId.mockImplementation(() => {
      throw new QueryFailedError('command', [], null);
    });

    try {
      await handler.execute(command);
      done.fail({ message: 'SequenceResultWasNotDeletedError was not thrown' });
    } catch (e) {
      if (e instanceof SequenceWasNotDeletedError) {
        expect(e.sequenceID).toEqual(sequenceID);
        expect(eventBus.publish).not.toBeCalled();
        done();
      } else {
        done.fail('Unknown exception was thrown.');
      }
    }
  });

  it('negative - should throw exception when unknown error', async (done: DoneCallback) => {
    const sequenceID = -1;
    const command = new SequenceDeleteCommand(sequenceID);

    service.byId.mockImplementation(() => {
      throw new Error();
    });

    try {
      await handler.execute(command);
      done.fail({ message: 'SequenceResultWasNotDeletedError was not thrown' });
    } catch (e) {
      if (e instanceof SequenceWasNotDeletedError) {
        expect(e.sequenceID).toEqual(sequenceID);
        expect(eventBus.publish).not.toBeCalled();
        done();
      } else {
        done.fail('Unknown exception was thrown.');
      }
    }
  });
});
