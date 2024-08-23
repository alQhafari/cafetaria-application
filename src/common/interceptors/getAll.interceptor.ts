import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class getAllInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((result: { data: T[]; total: number }) => {
        const request = context.switchToHttp().getRequest();
        const { page = 1, limit = 3 } = request.query;

        const totalData = result.total;
        const totalPages = Math.ceil(totalData / limit);

        return {
          data: result.data,
          meta: {
            page: parseInt(page, 10),
            total_data: totalData,
            total_page: totalPages,
          },
        };
      }),
    );
  }
}
