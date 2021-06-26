import { Body, Controller, Get, Logger, Options, Patch, Post, UseGuards } from '@nestjs/common';

import { ResponseObject } from '@stechy1/diplomka-share';

import { PortIsAlreadyOpenException, PortIsNotOpenException } from '@diplomka-backend/stim-feature-stimulator/domain';
import { ControllerException } from '@diplomka-backend/stim-lib-common';
import { IsAuthorizedGuard } from '@diplomka-backend/stim-feature-auth/application';

import { SerialFacade } from '../service/serial.facade';

@Controller('/api/serial')
export class SerialController {
  private readonly logger: Logger = new Logger(SerialController.name);

  constructor(private readonly facade: SerialFacade) {}

  @Options('')
  public async optionsEmpty(): Promise<string> {
    return '';
  }

  @Options('*')
  public async optionsWildcard(): Promise<string> {
    return '';
  }

  @Get('discover')
  public async discover(): Promise<ResponseObject<Record<string, unknown>[]>> {
    this.logger.log('Přišel požadavek na prohledání všech dostupných sériových portů.');
    try {
      const devices = await this.facade.discover();
      return {
        data: devices,
      };
    } catch (e) {
      throw new ControllerException();
    }
  }

  @Post('open')
  @UseGuards(IsAuthorizedGuard)
  public async open(@Body() body: { path: string }): Promise<ResponseObject<void>> {
    this.logger.log('Přišel požadavek na otevření sériového portu.');
    try {
      await this.facade.open(body.path);
      return {
        message: {
          code: 0,
        },
      };
    } catch (e) {
      if (e instanceof PortIsAlreadyOpenException) {
        this.logger.error('Sériový port již je otevřený!');
        this.logger.error(e);
        throw new ControllerException(e.errorCode);
      } else {
        this.logger.error('Nastala neznámá chyba při otevírání portu!');
        this.logger.error(e);
      }
      throw new ControllerException();
    }
  }

  @Patch('stop')
  @UseGuards(IsAuthorizedGuard)
  public async close(): Promise<ResponseObject<void>> {
    this.logger.log('Přišel požadavek na zavření sériového portu.');
    try {
      await this.facade.close();
      return {
        message: {
          code: 0,
        },
      };
    } catch (e) {
      if (e instanceof PortIsNotOpenException) {
        this.logger.error('Žádný sériový port nebyl otevřený!');
        this.logger.error(e);
        throw new ControllerException(e.errorCode);
      } else {
        this.logger.error('Nastala neznámá chyba při zavírání sériového portu!');
        this.logger.error(e);
      }
      throw new ControllerException();
    }
  }

  @Get('status')
  public async status(): Promise<ResponseObject<{ connected: boolean }>> {
    this.logger.debug('Přišel požadavek na získání stavu sériové linky.');
    return { data: { connected: await this.facade.status() } };
  }
}
