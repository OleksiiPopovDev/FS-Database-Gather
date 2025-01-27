import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { HttpRequestType } from './types/http-request.type';

@Injectable()
export class RequesterService {
  constructor(private readonly httpService: HttpService) {}

  public async get<T>(request: HttpRequestType): Promise<T> {
    const response = await firstValueFrom(
      this.httpService.get(request.url, request.config),
    );

    return response.data as T;
  }
}
