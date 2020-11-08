import { DynamicModule, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { StimulatorModuleConfig, TOKEN_USE_VIRTUAL_SERIAL, TOKEN_USE_VIRTUAL_SERIAL_FACTORY } from '@diplomka-backend/stim-feature-stimulator/domain';
import { StimFeatureSettingsModule } from '@diplomka-backend/stim-feature-settings';
import { StimFeatureFileBrowserModule } from '@diplomka-backend/stim-feature-file-browser';
import { StimLibSocketModule } from '@diplomka-backend/stim-lib-socket';
import { CommandIdService, createCommandIdFactory } from '@diplomka-backend/stim-lib-common';
import { StimFeatureIpcInfrastructureModule } from '@diplomka-backend/stim-feature-ipc/infrastructure';

import { StimulatorService } from './service/stimulator.service';
import { serialPortFactoryProvider } from './provider/serial-port-factory.provider';
import { serialServiceProvider } from './provider/serial-service.provider';
import { FakeSerialResponder } from './service/serial/fake/fake-serial-responder';
import { DefaultFakeSerialResponder } from './service/serial/fake/fake-serial.positive-responder';
import { SerialHandlers } from './commands';
import { StimulatorQueries } from './queries';
import { StimulatorEvents } from './events';
import { StimulatorSagas } from './sagas';

@Module({})
export class StimFeatureStimulatorApplicationCoreModule {
  public static forRoot(config: StimulatorModuleConfig): DynamicModule {
    return {
      module: StimFeatureStimulatorApplicationCoreModule,
      imports: [CqrsModule, StimFeatureSettingsModule.forFeature(), StimFeatureFileBrowserModule.forFeature(), StimFeatureIpcInfrastructureModule, StimLibSocketModule],
      providers: [
        StimulatorService,
        serialPortFactoryProvider,
        serialServiceProvider,

        {
          provide: CommandIdService,
          useFactory: createCommandIdFactory(StimFeatureStimulatorApplicationCoreModule.name),
        },
        {
          provide: FakeSerialResponder,
          useClass: DefaultFakeSerialResponder,
        },
        {
          provide: TOKEN_USE_VIRTUAL_SERIAL_FACTORY,
          useValue: config.useVirtualSerialFactory,
        },
        {
          provide: TOKEN_USE_VIRTUAL_SERIAL,
          useValue: config.useVirtualSerial,
        },

        ...SerialHandlers,
        ...StimulatorQueries,
        ...StimulatorEvents,
        ...StimulatorSagas,
      ],

      exports: [TOKEN_USE_VIRTUAL_SERIAL],
    };
  }
}
