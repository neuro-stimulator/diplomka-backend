import { ICommand } from '@nestjs/cqrs';

export class PrepareNextExperimentRoundCommand implements ICommand {
  constructor(public readonly userID: number) {}
}
