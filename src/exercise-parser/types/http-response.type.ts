import { Exercise } from '../../database/entities/exercise.entity';

export type HttpResponseType = {
  count: number;
  next?: string;
  previous?: string;
  results: Exercise[];
};
