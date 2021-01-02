import { Sequence } from '@stechy1/diplomka-share';

import { SequenceEntity } from '../model/entity/sequence.entity';

export function entityToSequence(entity: SequenceEntity): Sequence {
  return {
    id: entity.id,
    experimentId: entity.experimentId,
    name: entity.name,
    created: entity.created,
    data: JSON.parse(entity.data) || [],
    size: entity.size,
    tags: JSON.parse(entity.tags) || [],
  };
}

export function sequenceToEntity(sequence: Sequence): SequenceEntity {
  const entity = new SequenceEntity();

  entity.id = <number>sequence.id;
  entity.experimentId = sequence.experimentId;
  entity.name = sequence.name;
  entity.created = sequence.created;
  entity.data = JSON.stringify(sequence.data);
  entity.size = sequence.size;
  entity.tags = JSON.stringify(sequence.tags);

  return entity;
}
