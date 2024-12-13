import { Injectable, Logger } from '@nestjs/common';
import PQueue from 'p-queue';
import Speaker from 'speaker';
import ffmpeg, { type FfmpegCommand } from 'fluent-ffmpeg';
import { path } from '@ffmpeg-installer/ffmpeg';
import { Readable } from 'node:stream';

interface AudioData {
  link: string;
  volume: number;
}

@Injectable()
export class PlayerService {
  private readonly logger = new Logger(PlayerService.name);
  private readonly queue: PQueue = new PQueue({ concurrency: 1 });
  private process: FfmpegCommand;

  constructor() {
    ffmpeg.setFfmpegPath(path);
  }

  addToQueue(audioData: AudioData): Promise<void> {
    return this.queue.add(() => this.play(audioData));
  }

  stopSong(): void {
    this.process.kill('SIGINT');
  }

  pauseQueue(): void {
    this.queue.pause();
  }

  clearQueue(): void {
    this.queue.clear();
  }

  async play({ link, volume }: AudioData): Promise<void> {
    const audioStream = (await fetch(link)).body;
    if (!audioStream) {
      return;
    }
    return new Promise((resolve) => {
      // transform mp3 to pcm for speaker
      this.process = ffmpeg()
        .input(Readable.fromWeb(audioStream))
        .inputFormat('mp3')
        .withAudioFilter(`volume=${(volume / 100).toString()}`)
        .noVideo()
        .outputFormat('s16le')
        .audioCodec('pcm_s16le')
        .on('start', (commandLine) => this.logger.debug('FFmpeg spawned', { commandLine }))
        .on('end', () => {
          this.logger.debug('FFmpeg instance ended');
          resolve();
        })
        .on('error', (error) => {
          this.logger.debug('FFmpeg error', error);
          resolve();
        });

      this.process.pipe(
        new Speaker({
          channels: 1,
          bitDepth: 16,
          sampleRate: 24000,
        }).on('error', (error) => {
          this.logger.debug('FFmpeg error', error);
          resolve();
        }),
        { end: true },
      );
    });
  }
}
