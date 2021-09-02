import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { ConnectionManager } from './connection-manager';

@Injectable()
export class Sqlite3Interceptor<T> implements NestInterceptor<T, T> {
  constructor(private connectionManager: ConnectionManager) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<T>> {
    this.connectionManager.openConnectionsContext();

    const release = (success: boolean) => () => this.connectionManager.closeConnectionsContext(success);

    return next.handle().pipe(
      tap({
        next: release(true),
        error: release(false),
      }),
    );
  }
}
