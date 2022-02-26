import { SequenceValidateHandler } from '../commands/handlers/sequence-validate.handler';

import { SequenceByIdHandler } from './handlers/sequence-by-id.handler';
import { SequenceNameExistsHandler } from './handlers/sequence-name-exists.handler';
import { SequencesAllHandler } from './handlers/sequences-all.handler';
import { SequencesForExperimentHandler } from './handlers/sequences-for-experiment.handler';


export const QueryHandlers = [SequencesAllHandler, SequenceByIdHandler, SequenceNameExistsHandler, SequencesForExperimentHandler, SequenceValidateHandler];
