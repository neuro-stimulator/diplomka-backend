import { Injectable } from '@nestjs/common';
import { plainToClass } from '@nestjs/class-transformer';

import { BaseSeederService, Seeder } from '@neuro-server/stim-feature-seed/domain';

import { ExperimentErpOutputEntity } from '../model/entity/experiment-erp-output.entity';

@Injectable()
@Seeder(ExperimentErpOutputEntity)
export class ExperimentErpOutputSeeder extends BaseSeederService<ExperimentErpOutputEntity> {
  protected convertEntities(data: ExperimentErpOutputEntity[]): ExperimentErpOutputEntity[] {
    return plainToClass(ExperimentErpOutputEntity, data);
  }
}
