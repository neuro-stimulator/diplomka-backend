import { ExperimentStopConditionParams, ExperimentStopConditionType, IOEvent } from '@stechy1/diplomka-share';

import { ExperimentStopCondition } from '@diplomka-backend/stim-feature-player/domain';

export class NoStopCondition implements ExperimentStopCondition {
  readonly stopConditionParams: ExperimentStopConditionParams = {};
  readonly stopConditionType: ExperimentStopConditionType = ExperimentStopConditionType.NO_STOP_CONDITION;

  canContinue(ioData: IOEvent[]): boolean {
    return true;
  }
}
