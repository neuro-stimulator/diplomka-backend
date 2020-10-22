import { ICommand } from '@nestjs/cqrs';

import { Experiment, Output } from '@stechy1/diplomka-share';

import { EXPERIMENT_FULL_GROUP } from '@diplomka-backend/stim-feature-experiments/domain';

export class ExperimentValidateCommand implements ICommand {
  constructor(public readonly experiment: Experiment<Output>, public readonly validationGroups: string[] = [EXPERIMENT_FULL_GROUP]) {}
}
