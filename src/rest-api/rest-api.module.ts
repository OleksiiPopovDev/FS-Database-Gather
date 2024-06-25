import { Module } from '@nestjs/common';
import { RequesterService } from './requester.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  exports: [HttpModule, RequesterService],
  providers: [RequesterService],
})
export class RestApiModule {}
