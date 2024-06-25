import { HttpService } from '@nestjs/axios';
import { HttpRequestType } from '../product-detail-parser/types/product-detail.type';
import { firstValueFrom } from 'rxjs';
import { Injectable } from '@nestjs/common';

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
