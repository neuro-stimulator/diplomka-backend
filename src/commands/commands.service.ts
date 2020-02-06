import { Injectable, Logger } from '@nestjs/common';

import { createEmptyExperimentResult, Experiment, ExperimentType, Sequence } from '@stechy1/diplomka-share';

import { SerialService } from '../low-level/serial.service';
import { ExperimentsService } from '../experiments/experiments.service';
import { IpcService } from '../ipc/ipc.service';
import * as buffers from './protocol/functions.protocol';
import { TOPIC_EXPERIMENT_STATUS } from '../ipc/protocol/ipc.protocol';
import { SequencesService } from '../sequences/sequences.service';
import { EventNextSequencePart } from '../low-level/protocol/hw-events';
import { MessagePublisher } from '../share/utils';

@Injectable()
export class CommandsService implements MessagePublisher {

  private readonly logger: Logger = new Logger(CommandsService.name);

  private _publishMessage: (topic: string, data: any) => void;

  constructor(private readonly _serial: SerialService,
              private readonly _experiments: ExperimentsService,
              private readonly _sequences: SequencesService,
              private readonly _ipc: IpcService) {
    this._serial.bindEvent(EventNextSequencePart.name, (event) => this._sendNextSequencePart(event));
  }

  private async _sendNextSequencePart(event: EventNextSequencePart) {
    const experimentId = this._experiments.experimentResult.experimentID;
    this.logger.log(`Budu nahrávat část sekvence s ID: ${experimentId}.`);
    const sequence: Sequence = await this._sequences.byId(experimentId);
    this._serial.write(buffers.bufferCommandNEXT_SEQUENCE_PART(sequence, event.offset));
  }

  public async uploadExperiment(id: number) {
    this.logger.log(`Budu nahrávat experiment s ID: ${id}.`);
    const experiment: Experiment = await this._experiments.byId(id);
    let sequence: Sequence;
    if (experiment.type === ExperimentType.ERP) {
      sequence = await this._sequences.byId(experiment.id);
    }
    this.logger.log(`Experiment je typu: ${experiment.type}`);
    this._ipc.send(TOPIC_EXPERIMENT_STATUS, {status: 'upload', id, outputCount: experiment.outputCount});
    this._serial.write(buffers.bufferCommandEXPERIMENT_UPLOAD(experiment, sequence));
    this._experiments.experimentResult = createEmptyExperimentResult(experiment);
  }

  public async setupExperiment(id: number) {
    this.logger.log(`Budu nastavovat experiment s ID: ${id}`);
    const experiment: Experiment = await this._experiments.byId(id);
    this._ipc.send(TOPIC_EXPERIMENT_STATUS, {status: 'setup', id, outputCount: experiment.outputCount});
    this._serial.write(buffers.bufferCommandEXPERIMENT_SETUP());
  }

  public startExperiment(id: number) {
    this.logger.log(`Spouštím experiment: ${id}`);
    this._ipc.send(TOPIC_EXPERIMENT_STATUS, {status: 'start', id});
    this._serial.write(buffers.bufferCommandMANAGE_EXPERIMENT(true));
  }

  public stopExperiment(id: number) {
    this.logger.log(`Zastavuji experiment: ${id}`);
    this._ipc.send(TOPIC_EXPERIMENT_STATUS, {status: 'stop', id});
    this._serial.write(buffers.bufferCommandMANAGE_EXPERIMENT(false));
  }

  public clearExperiment() {
    this.logger.log('Mažu konfiguraci experimentu...');
    this._ipc.send(TOPIC_EXPERIMENT_STATUS, {status: 'clear'});
    this._serial.write(buffers.bufferCommandCLEAR_EXPERIMENT());
  }

  public togleLed(index: number, enabled: number) {
    this.logger.verbose(`Prepinam ledku na: ${enabled}`);
    const buffer = Buffer.from([0xF0, +index, +enabled, 0x53]);
    this._serial.write(buffer);
  }

  public memoryRequest(memoryType: number) {
    this.logger.log(`Budu získávat pamět '${memoryType}' ze stimulátoru...`);
    const buffer = buffers.bufferDebug(memoryType);
    this._serial.write(buffer);
  }

  registerMessagePublisher(messagePublisher: (topic: string, data: any) => void) {
    this._publishMessage = messagePublisher;
  }

  publishMessage(topic: string, data: any): void {
    this._publishMessage(topic, data);
  }
}
