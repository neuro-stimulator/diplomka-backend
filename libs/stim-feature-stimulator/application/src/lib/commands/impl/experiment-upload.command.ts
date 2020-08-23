import { ICommand } from '@nestjs/cqrs';

export class ExperimentUploadCommand implements ICommand {
  constructor(public readonly experimentID: number, public readonly userID: number, public readonly waitForResponse = false) {}
}
