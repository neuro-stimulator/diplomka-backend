import { Test, TestingModule } from '@nestjs/testing';
import { EventBus } from '@nestjs/cqrs';
import DoneCallback = jest.DoneCallback;

import { QueryFailedError } from 'typeorm';

import { createEmptySequence, Sequence } from '@stechy1/diplomka-share';

import { commandBusProvider, eventBusProvider, MockType } from 'test-helpers/test-helpers';

import { SequencesService } from '../../../domain/services/sequences.service';
import { createSequencesServiceMock } from '../../../domain/services/sequences.service.jest';
import { SequenceWasNotCreatedError } from '../../../domain/exception/sequence-was-not-created.error';
import { SequenceWasCreatedEvent } from '../../event/impl/sequence-was-created.event';
import { SequenceInsertCommand } from '../impl/sequence-insert.command';
import { SequenceInsertHandler } from './sequence-insert.handler';

describe('SequenceInsertHandler', () => {
  let testingModule: TestingModule;
  let handler: SequenceInsertHandler;
  let service: MockType<SequencesService>;
  let eventBus: MockType<EventBus>;

  beforeEach(async () => {
    testingModule = await Test.createTestingModule({
      providers: [
        SequenceInsertHandler,
        {
          provide: SequencesService,
          useFactory: createSequencesServiceMock,
        },
        commandBusProvider,
        eventBusProvider,
      ],
    }).compile();

    handler = testingModule.get<SequenceInsertHandler>(SequenceInsertHandler);
    // @ts-ignore
    service = testingModule.get<MockType<SequencesService>>(SequencesService);
    // @ts-ignore
    eventBus = testingModule.get<MockType<EventBus>>(EventBus);
  });

  afterEach(() => {
    service.insert.mockClear();
    eventBus.publish.mockClear();
  });

  it('positive - should insert sequence', async () => {
    const sequence: Sequence = createEmptySequence();
    sequence.id = 1;
    const command = new SequenceInsertCommand(sequence);

    service.insert.mockReturnValue(sequence.id);

    const result = await handler.execute(command);

    expect(result).toEqual(sequence.id);
    expect(service.insert).toBeCalledWith(sequence);
    expect(eventBus.publish).toBeCalledWith(new SequenceWasCreatedEvent(sequence.id));
  });

  it('negative - should throw exception when sequence not found', async (done: DoneCallback) => {
    const sequence: Sequence = createEmptySequence();
    sequence.id = 1;
    const command = new SequenceInsertCommand(sequence);

    service.insert.mockImplementation(() => {
      throw new QueryFailedError('command', [], null);
    });

    try {
      await handler.execute(command);
      done.fail({ message: 'SequenceWasNotCreatedError was not thrown' });
    } catch (e) {
      if (e instanceof SequenceWasNotCreatedError) {
        expect(eventBus.publish).not.toBeCalled();
        done();
      } else {
        done.fail('Unknown exception was thrown.');
      }
    }
  });

  it('negative - should throw exception when unknown error', async (done: DoneCallback) => {
    const sequence: Sequence = createEmptySequence();
    sequence.id = 1;
    const command = new SequenceInsertCommand(sequence);

    service.insert.mockImplementation(() => {
      throw new Error();
    });

    try {
      await handler.execute(command);
      done.fail({ message: 'SequenceWasNotCreatedError was not thrown' });
    } catch (e) {
      if (e instanceof SequenceWasNotCreatedError) {
        expect(eventBus.publish).not.toBeCalled();
        done();
      } else {
        done.fail('Unknown exception was thrown.');
      }
    }
  });
});
