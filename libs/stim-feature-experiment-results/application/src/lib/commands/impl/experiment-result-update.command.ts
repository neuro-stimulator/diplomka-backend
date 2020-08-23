import { ICommand } from '@nestjs/cqrs';
import { ExperimentResult } from '@stechy1/diplomka-share';

export class ExperimentResultUpdateCommand implements ICommand {
  constructor(public readonly experimentResult: ExperimentResult, public readonly userID: number) {}
}
