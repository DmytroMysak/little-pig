/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, Logger } from '@nestjs/common';
import PQueue from 'p-queue';
import Speaker from 'speaker';
import ffmpeg, { type FfmpegCommand } from 'fluent-ffmpeg';

interface AudioData {
  link: string;
  volume: number;
}

@Injectable()
export class PlayerService {
  private readonly logger = new Logger(PlayerService.name);
  private readonly queue: PQueue = new PQueue({ concurrency: 1 });
  private process: FfmpegCommand;
  private speaker: Speaker = new Speaker();

  addToQueue(audioData: AudioData): Promise<void> {
    return this.queue.add(() => this.play(audioData));
  }

  async stopSong(): Promise<void> {
    await (this.process as any)?.ffmpegProc?.stdin?.write('q');
  }

  pauseQueue(): void {
    this.queue.pause();
  }

  clearQueue(): void {
    this.queue.clear();
  }

  async play({ link, volume }: AudioData): Promise<void> {
    return new Promise((resolve, reject) => {
      this.speaker = new Speaker();

      this.process = ffmpeg()
        .addInput(link)
        .audioFilters(`volume=${(volume / 100).toString()}`)
        .noVideo()
        .format('s16le')
        .audioCodec('pcm_s16le')
        .on('start', (commandLine: string) => this.logger.debug(`Spawned FFmpeg with command: ${commandLine}`))
        .on('end', () => this.logger.debug('FFmpeg instance ended'))
        .on('error', (err: unknown) => this.logger.error(`FFmpeg error: ${(err as Error).message}`))
        .on('codecData', (codec: any) => {
          (this.speaker as any).channels = codec.audio_details[2] === 'mono' ? 1 : 2;
          (this.speaker as any).sampleRate = parseInt(codec.audio_details[1].match(/\d+/)[0], 10);
        });

      try {
        this.process.pipe(this.speaker);
      } catch {
        this.speaker.close(false);
      }

      this.speaker.on('close', () => resolve());
      this.speaker.on('error', (error) => reject(error));
    });
  }
}
