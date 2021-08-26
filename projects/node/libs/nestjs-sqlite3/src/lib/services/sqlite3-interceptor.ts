import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { ConnectionManager } from './connection-manager';

@Injectable()
export class Sqlite3Interceptor<T> implements NestInterceptor<T, T> {
  constructor(private connectionManager: ConnectionManager) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<T>> {
    this.connectionManager.openConnectionsContext();

    const release = () => this.connectionManager.closeConnectionsContext();

    return next.handle().pipe(
      tap({
        next: release,
        error: release,
      }),
    );
  }
}
