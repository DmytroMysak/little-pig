import { Expose } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Command } from '../constants.js';

export class BaseCommand {
  @Expose()
  @IsEnum(Command)
  @IsNotEmpty()
  command: Command;

  @Expose()
  @IsString()
  @IsNotEmpty()
  requestId: string;
}
