import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { PlayerService } from '../services/player.service.js';
import { BaseCommand } from './base.handler.js';
import ytdl from 'ytdl-core';
import { Logger } from '@nestjs/common';

export class PlayYoutubeCommand extends BaseCommand {
  @Expose()
  @IsString()
  @IsNotEmpty()
  link: string;

  @Expose()
  @IsNumber()
  @IsNotEmpty()
  volume: number;
}

@CommandHandler(PlayYoutubeCommand)
export class PlayYoutubeHandler implements ICommandHandler<PlayYoutubeCommand> {
  private readonly logger = new Logger(PlayYoutubeHandler.name);

  constructor(private readonly playerService: PlayerService) {}

  async execute(command: PlayYoutubeCommand): Promise<{ message: string } | undefined> {
    let info: ytdl.videoInfo;
    try {
      // { requestOptions: { headers: { Cookie: config.youtubeCookie } } }
      info = await ytdl.getInfo(command.link);
    } catch (error) {
      this.logger.error({ error, command });
      return { message: error.message };
    }

    // audio only, sorted by quality (highest bitrate)
    const [audio] = ytdl
      .filterFormats(info.formats, 'audioonly')
      .sort((a, b) => (b.audioBitrate ?? 0) - (a.audioBitrate ?? 0));

    this.logger.debug(`Audio quality: ${audio.audioBitrate?.toString() ?? ''}kbps (${audio.mimeType ?? ''})`);

    // low resolution video only, webm prefered (lowest resolution)
    // const [video] = ytdl.filterFormats(info.formats || [], 'highestaudio')
    //   .sort((a) => (a.container === 'webm' ? -1 : 1));
    // if (video) {
    //   logger.debug(`Video format: ${video.resolution} [${video.size}] (${video.encoding}) ${video.fps}`);
    // }

    await this.playerService.addToQueue({ volume: command.volume, link: audio.url });
  }
}
