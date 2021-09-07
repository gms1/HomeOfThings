import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { from, Observable, tap } from 'rxjs';
import { ConnectionManager } from './connection-manager';

@Injectable()
export class Sqlite3Interceptor<T> implements NestInterceptor<T, T> {
  constructor(private connectionManager: ConnectionManager) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<T>> {
    await this.connectionManager.createConnectionContext();

    const release = (commit: boolean) => () => from(this.connectionManager.closeConnectionContext(commit));

    return next.handle().pipe(
      tap({
        next: release(true),
        error: release(false),
      }),
    );
  }
}
