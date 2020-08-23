import { Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { Experiment } from '@stechy1/diplomka-share';

import { ExperimentsService } from '../../services/experiments.service';
import { ExperimentsAllQuery } from '../impl/experiments-all.query';

@QueryHandler(ExperimentsAllQuery)
export class ExperimentsAllHandler implements IQueryHandler<ExperimentsAllQuery, Experiment[]> {
  private readonly logger: Logger = new Logger(ExperimentsAllHandler.name);

  constructor(private readonly service: ExperimentsService) {}

  execute(query: ExperimentsAllQuery): Promise<Experiment[]> {
    this.logger.debug('Budu vyhledávat všechny experimenty.');
    return this.service.findAll({ where: { userId: query.userID } });
  }
}
