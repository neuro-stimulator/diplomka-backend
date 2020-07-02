import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';

import { Validator } from 'jsonschema';

import { StimFeatureStimulatorModule } from '@diplomka-backend/stim-feature-stimulator';
import { StimFeatureExperimentsModule } from '@diplomka-backend/stim-feature-experiments';
import { StimFeatureFileBrowserModule } from '@diplomka-backend/stim-feature-file-browser';
import { StimLibSocketModule } from '@diplomka-backend/stim-lib-socket';

import { ExperimentResultsService } from './domain/services/experiment-results.service';
import { ExperimentResultEntity } from './domain/model/entity/experiment-result.entity';
import { ExperimentResultsController } from './infrastructure/controller/experiment-results.controller';
import { ExperimentResultsFacade } from './infrastructure/service/experiment-results.facade';
import { REPOSITORIES } from './domain/repository';
import { QueryHandlers } from './application/queries';
import { CommandHandlers } from './application/commands';
import { EventHandlers } from './application/event';
import { Sagas } from './application/sagas';

@Module({
  controllers: [ExperimentResultsController],
  imports: [
    TypeOrmModule.forFeature([ExperimentResultEntity]),
    CqrsModule,
    StimFeatureStimulatorModule.forFeature(),
    StimFeatureExperimentsModule,
    StimFeatureFileBrowserModule.forFeature(),
    StimLibSocketModule,
  ],
  providers: [
    ExperimentResultsService,
    ExperimentResultsFacade,
    {
      provide: Validator,
      useClass: Validator,
    },

    ...REPOSITORIES,
    ...QueryHandlers,
    ...CommandHandlers,
    ...EventHandlers,
    ...Sagas,
  ],
  exports: [ExperimentResultsFacade],
})
export class StimFeatureExperimentResultsModule {}
