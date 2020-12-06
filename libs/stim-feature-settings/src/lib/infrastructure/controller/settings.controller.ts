import { Body, Controller, Get, Logger, Options, Post, UseGuards } from '@nestjs/common';
import { QueryHandlerNotFoundException } from '@nestjs/cqrs';

import { MessageCodes, ResponseObject, Settings } from '@stechy1/diplomka-share';

import { IsAuthorizedGuard } from '@diplomka-backend/stim-feature-auth/application';

import { UpdateSettingsFailedException } from '../../domain/exception/update-settings-failed.exception';
import { SettingsFacade } from '../service/settings.facade';

@Controller('/api/settings')
export class SettingsController {
  private readonly logger: Logger = new Logger(SettingsController.name);

  constructor(private readonly facade: SettingsFacade) {}

  @Options('')
  public async optionsEmpty(): Promise<string> {
    return '';
  }

  @Options('*')
  public async optionsWildcard(): Promise<string> {
    return '';
  }

  @Get()
  public async getSettings(): Promise<ResponseObject<Settings>> {
    this.logger.log('Přišel požadavek na získání uživatelského serverového nastavení.');
    try {
      const settings: Settings = await this.facade.getSettings();
      return {
        data: settings,
      };
    } catch (e) {
      if (e instanceof QueryHandlerNotFoundException) {
        this.logger.error('Query handler nebyl nalezen!');
      }
      this.logger.error(e);
      return {
        message: {
          code: MessageCodes.CODE_ERROR,
        },
      };
    }
  }

  @Post()
  @UseGuards(IsAuthorizedGuard)
  public async updateSettings(@Body() settings: Settings): Promise<ResponseObject<void>> {
    try {
      await this.facade.updateSettings(settings);
      return {
        message: {
          code: MessageCodes.CODE_SUCCESS_SETTINGS_UPDATED,
        },
      };
    } catch (e) {
      this.logger.error(e.message);
      if (e instanceof UpdateSettingsFailedException) {
        return {
          message: {
            code: MessageCodes.CODE_ERROR_SETTINGS_NOT_UPDATED,
          },
        };
      }
      return {
        message: {
          code: MessageCodes.CODE_ERROR,
        },
      };
    }
  }
}
