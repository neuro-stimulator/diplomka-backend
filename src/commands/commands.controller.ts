import { Controller, Get, Logger, Options, Param, Patch } from '@nestjs/common';

import { CommandsService } from './commands.service';
import { MessageCodes, ResponseObject } from '@stechy1/diplomka-share';

@Controller('api/commands')
export class CommandsController {

  private readonly logger: Logger = new Logger(CommandsController.name);

  constructor(private readonly service: CommandsService) {}

  private static _createErrorMessage(code: number, error: any, params?: any): ResponseObject<any> {
    if (!isNaN(parseInt(error.message, 10))) {
      return { message: { code: parseInt(error.message, 10), params }};
    }

    return { message: { code }};
  }

  @Options('')
  public async optionsEmpty() {
    return '';
  }

  @Options('*')
  public async optionsWildcard() {
    return '';
  }

  @Get('stimulator-state')
  public async stimulatorState(): Promise<ResponseObject<{}>> {
    try {
      const state = await this.service.stimulatorState();
      return { data: state };
    } catch (error) {
      return CommandsController._createErrorMessage(MessageCodes.CODE_ERROR_COMMANDS_STIMULATOR_STATE, error);
    }
  }

  @Patch('experiment/upload/:id')
  public async uploadExperiment(@Param() params: {id: number}): Promise<ResponseObject<void>> {
    try {
      await this.service.uploadExperiment(params.id);
    } catch (error) {
      return CommandsController._createErrorMessage(MessageCodes.CODE_ERROR_COMMANDS_EXPERIMENT_UPLOAD, error, params);
    }
  }

  @Patch('experiment/setup/:id')
  public async setupExperiment(@Param() params: {id: number}): Promise<ResponseObject<void>> {
    try {
      await this.service.setupExperiment(params.id);
    } catch (error) {
      return CommandsController._createErrorMessage(MessageCodes.CODE_ERROR_COMMANDS_EXPERIMENT_SETUP, error, params);
    }
  }

  @Patch('experiment/run/:id')
  public async runExperiment(@Param() params: {id: number}): Promise<ResponseObject<void>> {
    try {
      this.service.runExperiment(params.id);
    } catch (error) {
      return CommandsController._createErrorMessage(MessageCodes.CODE_ERROR_COMMANDS_EXPERIMENT_RUN, error, params);
    }
  }

  @Patch('experiment/pause/:id')
  public async pauseExperiment(@Param() params: {id: number}): Promise<ResponseObject<void>> {
    try {
      this.service.pauseExperiment(params.id);
    } catch (error) {
      return CommandsController._createErrorMessage(MessageCodes.CODE_ERROR_COMMANDS_EXPERIMENT_PAUSE, error, params);
    }
  }

  @Patch('experiment/finish/:id')
  public async finishExperiment(@Param() params: {id: number}): Promise<ResponseObject<void>> {
    try {
      this.service.finishExperiment(params.id);
    } catch (error) {
      return CommandsController._createErrorMessage(MessageCodes.CODE_ERROR_COMMANDS_EXPERIMENT_FINISH, error, params);
    }
  }

  @Patch('experiment/clear')
  public async clearExperiment(): Promise<ResponseObject<void>> {
    try {
      this.service.clearExperiment();
    } catch (error) {
      return CommandsController._createErrorMessage(MessageCodes.CODE_ERROR_COMMANDS_EXPERIMENT_CLEAR, error);
    }
  }

  // Mimo oficiální protokol
  // V budoucnu se odstraní
  @Patch('toggle-led/:index/:enabled')
  public toggleLed(@Param() params: {index: string, enabled: string}) {
    this.service.togleLed(+params.index, +params.enabled);
  }

}
