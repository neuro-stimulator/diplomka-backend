import { StimulatorProtocol } from './stimulator.protocol';
import { ExperimentProtocolCodec } from './experiment.protocol.codec';
import { SequenceProtocolCodec } from './sequence.protocol.codec';
import { FakeProtocol } from './fake/fake.protocol';

export const PROTOCOL_PROVIDERS = [
  StimulatorProtocol,
  ExperimentProtocolCodec,
  SequenceProtocolCodec,
  FakeProtocol
];
