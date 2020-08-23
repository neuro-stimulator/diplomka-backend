import { Injectable, Logger } from '@nestjs/common';

import { FindManyOptions } from 'typeorm';

import { Sequence } from '@stechy1/diplomka-share';

import { SequenceIdNotFoundException, SequenceRepository, SequenceEntity } from '@diplomka-backend/stim-feature-sequences/domain';

@Injectable()
export class SequencesService {
  private readonly logger: Logger = new Logger(SequencesService.name);

  constructor(private readonly _repository: SequenceRepository) {}

  async findAll(options?: FindManyOptions<SequenceEntity>): Promise<Sequence[]> {
    this.logger.verbose(`Hledám všechny sequence s filtrem: '${JSON.stringify(options ? options.where : {})}'.`);
    const sequenceResults: Sequence[] = await this._repository.all(options);
    this.logger.verbose(`Bylo nalezeno: ${sequenceResults.length} záznamů.`);
    return sequenceResults;
  }

  async byId(id: number, userID: number): Promise<Sequence> {
    this.logger.verbose(`Hledám sequenci s id: ${id}`);
    const sequenceResult = await this._repository.one(id, userID);
    if (sequenceResult === undefined) {
      this.logger.warn(`Sekvence s id: ${id} nebyla nalezena!`);
      throw new SequenceIdNotFoundException(id);
    }
    return sequenceResult;
  }

  async insert(sequenceResult: Sequence, userID: number): Promise<number> {
    this.logger.verbose('Vkládám novou sequenci do databáze.');
    const result = await this._repository.insert(sequenceResult, userID);

    return result.raw;
  }

  async update(sequenceResult: Sequence, userID: number): Promise<void> {
    const originalExperiment = await this.byId(sequenceResult.id, userID);
    if (originalExperiment === undefined) {
      return undefined;
    }

    this.logger.verbose('Aktualizuji sequenci.');
    const result = await this._repository.update(sequenceResult);
  }

  async delete(id: number, userID: number): Promise<void> {
    const sequence = await this.byId(id, userID);
    if (sequence === undefined) {
      return undefined;
    }

    this.logger.verbose(`Mažu sequenci s id: ${id}`);
    const result = await this._repository.delete(id);
  }

  async nameExists(name: string, id: number | 'new'): Promise<boolean> {
    if (id === 'new') {
      this.logger.verbose(`Testuji, zda-li zadaný název nové sekvence již existuje: ${name}.`);
    } else {
      this.logger.verbose(`Testuji, zda-li zadaný název pro existující sekvenci již existuje: ${name}.`);
    }
    const exists = await this._repository.nameExists(name, id);
    this.logger.verbose(`Výsledek existence názvu: ${exists}.`);
    return exists;
  }
}
