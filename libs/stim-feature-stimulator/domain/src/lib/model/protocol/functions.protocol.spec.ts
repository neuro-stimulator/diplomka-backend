import DoneCallback = jest.DoneCallback;

import {
  CommandToStimulator,
  createEmptyExperimentCVEP,
  createEmptyExperimentERP,
  createEmptyExperimentFVEP,
  createEmptyExperimentREA,
  createEmptyExperimentTVEP,
  createEmptyOutputERP,
  createEmptyOutputFVEP,
  createEmptyOutputTVEP,
  createEmptySequence,
  ExperimentCVEP,
  ExperimentERP,
  ExperimentFVEP,
  ExperimentREA,
  ExperimentTVEP,
  outputTypeToRaw,
  Sequence,
} from '@stechy1/diplomka-share';

import 'test-helpers/test-helpers';

import {
  bufferCommandEXPERIMENT_UPLOAD,
  bufferCommandMANAGE_EXPERIMENT,
  bufferCommandNEXT_SEQUENCE_PART,
  bufferCommandSTIMULATOR_STATE,
  MANAGE_EXPERIMENT_MAP,
} from './functions.protocol';

const TOTAL_OUTPUT_COUNT = 8;
describe('Command STIMULATOR_STATE', () => {
  it('should have right command format', () => {
    const commandID = 0;
    const command = bufferCommandSTIMULATOR_STATE(commandID);
    let offset = 0;

    expect(command.length).toBe(3);
    expect(command.readUInt8(offset++)).toBe(commandID);
    expect(command.readUInt8(offset++)).toBe(CommandToStimulator.COMMAND_STIMULATOR_STATE);
    expect(command.readUInt8(offset++)).toBe(CommandToStimulator.COMMAND_DELIMITER);
  });
});

describe('Command MANAGE_EXPERIMENT', () => {
  for (const [key, value] of Object.entries(MANAGE_EXPERIMENT_MAP)) {
    it(`should have right command format for ${key}`, () => {
      const commandID = 0;
      // @ts-ignore
      const command = bufferCommandMANAGE_EXPERIMENT(commandID, key);
      let offset = 0;

      expect(command.length).toBe(4);
      expect(command.readUInt8(offset++)).toBe(commandID);
      expect(command.readUInt8(offset++)).toBe(CommandToStimulator.COMMAND_MANAGE_EXPERIMENT);
      expect(command.readUInt8(offset++)).toBe(value);
      expect(command.readUInt8(offset++)).toBe(CommandToStimulator.COMMAND_DELIMITER);
    });
  }
});

describe('Command EXPERIMENT_UPLOAD', () => {
  describe('ERP experiment', () => {
    it('should have right command format', (done: DoneCallback) => {
      const commandID = 0;
      const experiment: ExperimentERP = createEmptyExperimentERP();
      const sequence: Sequence = createEmptySequence();
      sequence.size = 20;
      experiment.outputCount = TOTAL_OUTPUT_COUNT;
      experiment.outputs = new Array(experiment.outputCount).fill(0).map((value, index: number) => createEmptyOutputERP(experiment, index));
      const command = bufferCommandEXPERIMENT_UPLOAD(commandID, experiment, sequence);
      let offset = 0;

      try {
        // 26 =  základní data o experimentu
        // 22 = data pro každý výstup
        expect(command.length).toBe(26 + 22 * experiment.outputCount);
        expect(command.readUInt8(offset++)).toBe(commandID);
        expect(command.readUInt8(offset++)).toBe(CommandToStimulator.COMMAND_MANAGE_EXPERIMENT);
        expect(command.readUInt8(offset++)).toBe(CommandToStimulator.COMMAND_MANAGE_EXPERIMENT_UPLOAD);
        expect(command.readUInt8(offset++)).toBe(experiment.type);

        expect(command.readUInt8(offset++)).toBe(experiment.outputCount);
        expect(command.readUInt32LE(offset)).toBe(Math.round(experiment.out) * 1000);
        offset += 4;
        expect(command.readUInt32LE(offset)).toBe(0);
        offset += 4;
        expect(command.readUInt32LE(offset)).toBe(Math.round(experiment.wait) * 1000);
        offset += 4;
        expect(command.readUInt32LE(offset)).toBe(0);
        offset += 4;
        expect(command.readUInt8(offset++)).toBe(experiment.random);
        expect(command.readUInt8(offset++)).toBe(experiment.edge);
        expect(command.readUInt16LE(offset)).toBe(sequence.size);
        offset += 2;

        expect(command.readUInt8(offset++)).toBe(CommandToStimulator.COMMAND_DELIMITER);

        for (let i = 0; i < experiment.outputCount; i++) {
          expect(command.readUInt8(offset++)).toBe(commandID);
          expect(command.readUInt8(offset++)).toBe(CommandToStimulator.COMMAND_OUTPUT_SETUP);
          expect(command.readUInt8(offset++)).toBe(i);

          expect(command.readUInt8(offset++)).toBe(outputTypeToRaw(experiment.outputs[i].outputType));
          expect(command.readUInt32LE(offset)).toBe(Math.round(experiment.outputs[i].pulseUp) * 1000);
          offset += 4;
          expect(command.readUInt32LE(offset)).toBe(0);
          offset += 4;
          expect(command.readUInt32LE(offset)).toBe(Math.round(experiment.outputs[i].pulseDown) * 1000);
          offset += 4;
          expect(command.readUInt32LE(offset)).toBe(0);
          offset += 4;
          expect(command.readUInt8(offset++)).toBe(experiment.outputs[i].brightness);

          expect(command.readUInt8(offset++)).toBe(CommandToStimulator.COMMAND_DELIMITER);
        }
      } catch (error) {
        done.fail({ message: `Offset: ${offset} - ${error}` });
        return;
      }

      done();
    });
  });

  describe('CVEP experiment', () => {
    it('should have right command format', (done: DoneCallback) => {
      const commandID = 0;
      const experiment: ExperimentCVEP = createEmptyExperimentCVEP();
      experiment.outputCount = TOTAL_OUTPUT_COUNT;
      const command = bufferCommandEXPERIMENT_UPLOAD(commandID, experiment);
      let offset = 0;

      try {
        expect(command.length).toBe(29);
        expect(command.readUInt8(offset++)).toBe(commandID);
        expect(command.readUInt8(offset++)).toBe(CommandToStimulator.COMMAND_MANAGE_EXPERIMENT);
        expect(command.readUInt8(offset++)).toBe(CommandToStimulator.COMMAND_MANAGE_EXPERIMENT_UPLOAD);
        expect(command.readUInt8(offset++)).toBe(experiment.type);

        expect(command.readUInt8(offset++)).toBe(experiment.outputCount);
        expect(command.readUInt8(offset++)).toBe(outputTypeToRaw(experiment.usedOutputs));
        expect(command.readUInt32LE(offset)).toBe(experiment.out * 1000);
        offset += 4;
        expect(command.readUInt32LE(offset)).toBe(0);
        offset += 4;
        expect(command.readUInt32LE(offset)).toBe(experiment.wait * 1000);
        offset += 4;
        expect(command.readUInt32LE(offset)).toBe(0);
        offset += 4;
        expect(command.readUInt8(offset++)).toBe(experiment.bitShift);
        expect(command.readUInt8(offset++)).toBe(experiment.brightness);
        expect(command.readUInt32LE(offset)).toBe(experiment.pattern);
        offset += 4;

        expect(command.readUInt8(offset++)).toBe(CommandToStimulator.COMMAND_DELIMITER);
      } catch (error) {
        done.fail({ message: `Offset: ${offset} - ${error}` });
        return;
      }

      done();
    });
  });

  describe('FVEP experiment', () => {
    it('should have right command format', (done: DoneCallback) => {
      const commandID = 0;
      const experiment: ExperimentFVEP = createEmptyExperimentFVEP();
      experiment.outputCount = TOTAL_OUTPUT_COUNT;
      experiment.outputs = new Array(experiment.outputCount).fill(0).map((value, index: number) => createEmptyOutputFVEP(experiment, index));
      const command = bufferCommandEXPERIMENT_UPLOAD(commandID, experiment);
      let offset = 0;

      try {
        // 6 =  základní data o experimentu
        // 22 = data pro každý výstup
        expect(command.length).toBe(6 + 22 * experiment.outputCount);
        expect(command.readUInt8(offset++)).toBe(commandID);
        expect(command.readUInt8(offset++)).toBe(CommandToStimulator.COMMAND_MANAGE_EXPERIMENT);
        expect(command.readUInt8(offset++)).toBe(CommandToStimulator.COMMAND_MANAGE_EXPERIMENT_UPLOAD);
        expect(command.readUInt8(offset++)).toBe(experiment.type);

        expect(command.readUInt8(offset++)).toBe(experiment.outputCount);

        expect(command.readUInt8(offset++)).toBe(CommandToStimulator.COMMAND_DELIMITER);

        for (let i = 0; i < experiment.outputCount; i++) {
          expect(command.readUInt8(offset++)).toBe(commandID);
          expect(command.readUInt8(offset++)).toBe(CommandToStimulator.COMMAND_OUTPUT_SETUP);
          expect(command.readUInt8(offset++)).toBe(i);

          expect(command.readUInt8(offset++)).toBe(outputTypeToRaw(experiment.outputs[i].outputType));
          expect(command.readUInt32LE(offset)).toBe(Math.round(experiment.outputs[i].timeOn) * 1000);
          offset += 4;
          expect(command.readUInt32LE(offset)).toBe(0);
          offset += 4;
          expect(command.readUInt32LE(offset)).toBe(Math.round(experiment.outputs[i].timeOff) * 1000);
          offset += 4;
          expect(command.readUInt32LE(offset)).toBe(0);
          offset += 4;
          expect(command.readUInt8(offset++)).toBe(experiment.outputs[i].brightness);

          expect(command.readUInt8(offset++)).toBe(CommandToStimulator.COMMAND_DELIMITER);
        }
      } catch (error) {
        done.fail({ message: `Offset: ${offset} - ${error}` });
        return;
      }

      done();
    });
  });

  describe('TVEP experiment', () => {
    it('should have right command format', (done: DoneCallback) => {
      const commandID = 0;
      const experiment: ExperimentTVEP = createEmptyExperimentTVEP();
      experiment.outputCount = TOTAL_OUTPUT_COUNT;
      experiment.outputs = new Array(experiment.outputCount).fill(0).map((value, index: number) => createEmptyOutputTVEP(experiment, index));
      const command = bufferCommandEXPERIMENT_UPLOAD(commandID, experiment);
      let offset = 0;

      try {
        // 6 =  základní data o experimentu
        // 27 = data pro každý výstup
        expect(command.length).toBe(6 + 27 * experiment.outputCount);
        expect(command.readUInt8(offset++)).toBe(commandID);
        expect(command.readUInt8(offset++)).toBe(CommandToStimulator.COMMAND_MANAGE_EXPERIMENT);
        expect(command.readUInt8(offset++)).toBe(CommandToStimulator.COMMAND_MANAGE_EXPERIMENT_UPLOAD);
        expect(command.readUInt8(offset++)).toBe(experiment.type);

        expect(command.readUInt8(offset++)).toBe(experiment.outputCount);

        expect(command.readUInt8(offset++)).toBe(CommandToStimulator.COMMAND_DELIMITER);

        for (let i = 0; i < experiment.outputCount; i++) {
          expect(command.readUInt8(offset++)).toBe(commandID);
          expect(command.readUInt8(offset++)).toBe(CommandToStimulator.COMMAND_OUTPUT_SETUP);
          expect(command.readUInt8(offset++)).toBe(i);

          expect(command.readUInt8(offset++)).toBe(experiment.outputs[i].patternLength);
          expect(command.readUInt8(offset++)).toBe(outputTypeToRaw(experiment.outputs[i].outputType));
          expect(command.readUInt32LE(offset)).toBe(Math.round(experiment.outputs[i].out) * 1000);
          offset += 4;
          expect(command.readUInt32LE(offset)).toBe(0);
          offset += 4;
          expect(command.readUInt32LE(offset)).toBe(Math.round(experiment.outputs[i].wait) * 1000);
          offset += 4;
          expect(command.readUInt32LE(offset)).toBe(0);
          offset += 4;
          expect(command.readUInt8(offset++)).toBe(experiment.outputs[i].brightness);
          expect(command.readUInt32LE(offset)).toBe(experiment.outputs[i].pattern);
          offset += 4;

          expect(command.readUInt8(offset++)).toBe(CommandToStimulator.COMMAND_DELIMITER);
        }
      } catch (error) {
        done.fail({ message: `Offset: ${offset} - ${error}` });
        return;
      }

      done();
    });
  });

  describe('REA experiment', () => {
    it('should have right command format', (done: DoneCallback) => {
      const commandID = 0;
      const experiment: ExperimentREA = createEmptyExperimentREA();
      experiment.outputCount = TOTAL_OUTPUT_COUNT;
      const command = bufferCommandEXPERIMENT_UPLOAD(commandID, experiment);
      let offset = 0;

      try {
        expect(command.length).toBe(34);
        expect(command.readUInt8(offset++)).toBe(commandID);
        expect(command.readUInt8(offset++)).toBe(CommandToStimulator.COMMAND_MANAGE_EXPERIMENT);
        expect(command.readUInt8(offset++)).toBe(CommandToStimulator.COMMAND_MANAGE_EXPERIMENT_UPLOAD);
        expect(command.readUInt8(offset++)).toBe(experiment.type);

        expect(command.readUInt8(offset++)).toBe(experiment.outputCount);
        expect(command.readUInt8(offset++)).toBe(outputTypeToRaw(experiment.usedOutputs));
        expect(command.readUInt8(offset++)).toBe(experiment.cycleCount);
        expect(command.readUInt32LE(offset)).toBe(experiment.waitTimeMin * 1000);
        offset += 4;
        expect(command.readUInt32LE(offset)).toBe(0);
        offset += 4;
        expect(command.readUInt32LE(offset)).toBe(experiment.waitTimeMax * 1000);
        offset += 4;
        expect(command.readUInt32LE(offset)).toBe(0);
        offset += 4;
        expect(command.readUInt32LE(offset)).toBe(experiment.missTime * 1000);
        offset += 4;
        expect(command.readUInt32LE(offset)).toBe(0);
        offset += 4;
        expect(command.readUInt8(offset++)).toBe(experiment.onFail);
        expect(command.readUInt8(offset++)).toBe(experiment.brightness);

        expect(command.readUInt8(offset++)).toBe(CommandToStimulator.COMMAND_DELIMITER);
      } catch (error) {
        done.fail({ message: `Offset: ${offset} - ${error}` });
        return;
      }

      done();
    });
  });
});

describe('Command NEXT_SEQUENCE_PART', () => {
  const index = 1;

  it('should have right command format for sequence', (done: DoneCallback) => {
    const commandID = 0;
    const sequence: Sequence = createEmptySequence();
    sequence.size = 100;
    sequence.data = new Array(sequence.size).fill(0).map(() => Math.round(Math.random() * TOTAL_OUTPUT_COUNT));
    const offset = 0;
    const command = bufferCommandNEXT_SEQUENCE_PART(commandID, sequence, offset, index);
    let bufferOffset = 0;

    try {
      expect(command.readUInt8(bufferOffset++)).toBe(commandID);
      expect(command.readUInt8(bufferOffset++)).toBe(CommandToStimulator.COMMAND_SEQUENCE_NEXT_PART);
      expect(command.readUInt8(bufferOffset++)).toBe(index);

      const data = command.readUInt32LE(bufferOffset);
      bufferOffset += 4;
      const buffer: number[] = sequence.data.slice(offset, Math.min(offset + 8, sequence.data.length));

      for (let i = 0; i < buffer.length; i++) {
        expect(buffer[i]).toBe((data >> (4 * i)) & 0xf);
      }

      expect(command.readUInt8(bufferOffset++)).toBe(CommandToStimulator.COMMAND_DELIMITER);
    } catch (error) {
      done.fail({ message: `Offset: ${bufferOffset} - ${error}` });
      return;
    }

    done();
  });
});
