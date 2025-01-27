import { Command, CommandRunner } from 'nest-commander';
import { RequesterService } from '../rest-api/requester.service';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cliProgress from 'cli-progress';

import { HttpRequestType } from '../rest-api/types/http-request.type';
import { HttpResponseType } from './types/http-response.type';
import { Promise as BluebirdPromise } from 'bluebird';
import { ExerciseRepository } from './repositories/exercise.repository';
import { EndpointList } from './enums/endpoint-list.enum';

@Command({
  name: 'exercise-info-parse',
  description: 'Parse exercises info',
})
export class ExerciseInfoParserCommand extends CommandRunner {
  private totalExercises: number = 0;
  private processedExercises: number = 0;
  private progressBar: cliProgress.SingleBar;

  constructor(
    private readonly requesterService: RequesterService,
    private readonly exerciseRepository: ExerciseRepository,
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) {
    super();
  }

  public async run() {
    try {
      this.progressBar = new cliProgress.SingleBar({
        format:
          'Progress |{bar}| {percentage}% || {value}/{total} Chunks || ETA: {eta_formatted}',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true,
      });

      this.logger.log('Counting total number of exercises...');
      this.totalExercises = await this.fetchExerciseCount();
      const limit = 100;
      const urls: string[] = Array.from(
        { length: Math.ceil(this.totalExercises / limit) },
        (_, i) =>
          this.buildUrl(EndpointList.EXERCISE_INFO, {
            limit,
            offset: limit * i,
          }),
      ); //.splice(0, 3);

      this.progressBar.start(this.totalExercises, 0);

      await BluebirdPromise.map(urls, this.taskHandler, {
        concurrency: this.getQueueLength(),
      });

      this.progressBar.stop();
    } catch (error) {
      this.logger.error(
        'Error in running the exercise info parser command',
        error.message,
      );
    }
  }

  private readonly taskHandler = async (url: string) => {
    try {
      const response = await this.requesterService.get<HttpResponseType>({
        url: url,
      } as HttpRequestType);

      for (const exercise of response.results) {
        await this.exerciseRepository.save(exercise);
        this.progressBar.update(++this.processedExercises);
      }

      await BluebirdPromise.delay(
        Number(this.configService.get<number>('REQUEST_TIMEOUT')),
      );
    } catch (error) {
      this.logger.error('Error in processing exercise', error.message);
    }
  };

  private getQueueLength(): number {
    return Number(this.configService.get<number>('REQUEST_QUEUE_LENGTH')) || 10;
  }

  private async fetchExerciseCount(): Promise<number> {
    const response = await this.requesterService.get<HttpResponseType>({
      url: this.buildUrl(EndpointList.EXERCISE_INFO, { limit: 1 }),
    } as HttpRequestType);

    if (response.results.length == 0) {
      throw new Error('No data for parsing');
    }

    return response.count;
  }

  private buildUrl(
    endpoint: EndpointList,
    params: Record<string, string | number>,
  ): string {
    const baseUrl = this.configService.get<string>('SOURCE_EXERCISE_URL');
    if (!baseUrl) {
      throw new Error(
        'You should set up SOURCE_EXERCISE_URL for parsing exercises!',
      );
    }
    const formattedBaseUrl = baseUrl.endsWith('/')
      ? baseUrl.slice(0, -1)
      : baseUrl;
    const formattedEndpoint = endpoint.startsWith('/')
      ? endpoint
      : `/${endpoint}`;

    const url = new URL(formattedBaseUrl + formattedEndpoint);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value.toString());
    });
    return url.toString();
  }
}
