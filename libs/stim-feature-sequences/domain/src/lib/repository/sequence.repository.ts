import { Injectable } from '@nestjs/common';
import { EntityManager, FindManyOptions, Not, Repository } from 'typeorm';

import { Sequence } from '@stechy1/diplomka-share';

import { SequenceEntity } from '../model/entity/sequence.entity';
import { entityToSequence, sequenceToEntity } from './sequences.mapping';

@Injectable()
export class SequenceRepository {
  private readonly _repository: Repository<SequenceEntity>;

  constructor(_manager: EntityManager) {
    this._repository = _manager.getRepository(SequenceEntity);
  }

  async all(options?: FindManyOptions<SequenceEntity>): Promise<Sequence[]> {
    const sequenceEntities: SequenceEntity[] = await this._repository.find(options);

    return sequenceEntities.map((value: SequenceEntity) => entityToSequence(value));
  }
  async one(id: number, userId: number): Promise<Sequence | undefined> {
    const sequenceEntity = await this._repository.findOne({ where: { id, userId } });
    if (sequenceEntity === undefined) {
      return undefined;
    }

    return entityToSequence(sequenceEntity);
  }
  async insert(sequence: Sequence, userId: number): Promise<any> {
    const entity: SequenceEntity = sequenceToEntity(sequence);
    entity.userId = userId;

    return this._repository.insert(entity);
  }
  async update(sequence: Sequence): Promise<any> {
    return this._repository.update({ id: sequence.id }, sequenceToEntity(sequence));
  }
  async delete(id: number): Promise<any> {
    return this._repository.delete({ id });
  }

  async nameExists(name: string, id: number | 'new'): Promise<boolean> {
    let record;
    if (id === 'new') {
      record = await this._repository.findOne({ name });
    } else {
      record = await this._repository.findOne({ name, id: Not(id) });
    }

    return record !== undefined;
  }
}
