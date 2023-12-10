import { LoggerService } from '@homeofthings/nestjs-logger';
import { ExpressAdapter } from '@nestjs/platform-express';
import _debug from 'debug';
import express from 'express';
import * as fs from 'fs';
import helmet from 'helmet';
import * as http from 'http';
import * as https from 'https';
import * as net from 'net';
import { TLSSocket } from 'tls';

import { ExpressApplicationOptions } from './express-application-options';

const EXPRESS_APPLICATION_CONTEXT = 'hot:express';
const debug = _debug(EXPRESS_APPLICATION_CONTEXT);

export class ExpressApplication {
  private readonly _options?: ExpressApplicationOptions;
  private readonly _logger: LoggerService;
  private readonly _app: express.Express;
  private readonly _adapter: ExpressAdapter;

  private _httpsServer?: https.Server;
  private _httpServer?: http.Server;

  get app(): express.Express {
    return this._app;
  }

  get adapter(): ExpressAdapter {
    return this._adapter;
  }

  constructor(logger: LoggerService, options: ExpressApplicationOptions) {
    this._logger = logger;
    this._options = options;
    this._app = express();
    this.registerGlobalMiddleware();
    this._adapter = new ExpressAdapter(this._app);
    debug('constructed');
  }

  private registerGlobalMiddleware() {
    this._app.use(helmet());
    this._app.use(this.httpRedirectMiddleware.bind(this));
  }

  createServer(): boolean | undefined {
    debug('creating server');
    if (this._options.trustProxy) {
      // NOTE: req.hostname, req.protocol, req.ip and req.ips will be set accordingly if coming from trusted reverse proxy
      debug(`set "trust proxy" to '${this._options.trustProxy}'`);
      this._app.set('trust-proxy', this._options.trustProxy);
    }
    if (this._options.https && !this._options.https.disabled) {
      try {
        this._httpsServer = https.createServer(
          {
            cert: this._options.https.cert ? fs.readFileSync(this._options.https.cert, { encoding: 'utf-8' }) : undefined,
            key: this._options.https.key ? fs.readFileSync(this._options.https.key, { encoding: 'utf-8' }) : undefined,
            maxHeaderSize: this._options.https.maxHeaderSize,
          },
          this._app,
        );
        debug('https server created');
      } catch (err) {
        this._logger.error('failed to create https server', err.stack, EXPRESS_APPLICATION_CONTEXT);
        return undefined;
      }
    }
    if (this._options.http && !this._options.http?.disabled) {
      try {
        this._httpServer = http.createServer(
          {
            maxHeaderSize: this._options.http.maxHeaderSize,
          },
          this._app,
        );
        debug('http server created');
      } catch (err) {
        this._logger.error('failed to create http server', err.stack, EXPRESS_APPLICATION_CONTEXT);
        return undefined;
      }
    }
    return true;
  }

  close(): Promise<void> {
    const promises: Promise<void>[] = [];
    if (this._httpsServer) {
      promises.push(closeServer(this._httpsServer));
    }
    if (this._httpServer) {
      promises.push(closeServer(this._httpServer));
    }
    return Promise.allSettled(promises).then(() => {
      debug('server closed');
    });
  }

  // promisify listen helper
  listen(cb?: (address: string) => void): Promise<void> {
    debug('start listening');
    const promises: Promise<void>[] = [];
    const address = this._options?.address;
    if (this._httpsServer) {
      promises.push(listenServer(this._httpsServer, { port: this._options?.https?.port ?? 443, host: address }, 'https', cb));
    }
    if (this._httpServer) {
      promises.push(listenServer(this._httpServer, { port: this._options?.http?.port ?? 80, host: address }, 'http', cb));
    }
    return Promise.all(promises).then(() => {
      debug('listening started');
    });
  }

  httpRedirectMiddleware(req: express.Request, res: express.Response, next: express.NextFunction): void {
    // redirect http to https
    if (!(req.socket as TLSSocket).encrypted && this._options?.http?.redirect !== false) {
      let redirectUrl = this._options?.http?.redirectLocation;
      if (!redirectUrl) {
        const port = this._options?.https?.port ?? 443;
        redirectUrl = 'https://' + (req.headers.host ?? '').split(':')[0] + (port === 443 ? '' : ':' + port);
      }
      redirectUrl += req.url ?? '';
      debug(`redirecting to ${redirectUrl}`);
      // eslint-disable-next-line @typescript-eslint/naming-convention
      res.writeHead(this._options?.http?.redirectCode ?? 307, {
        Location: redirectUrl,
      });
      res.end(redirectUrl);
      next();
    }
    return next();
  }
}

function listenServer(server: net.Server, opts: net.ListenOptions, proto: 'http' | 'https', cb?: (address: string) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const listeningListener = () => {
      const serverAddress = server.address();
      const address = serverAddress ? proto + '://' + (typeof serverAddress === 'string' ? serverAddress : `${serverAddress.address}:${serverAddress.port}`) : undefined;
      debug('listening on: ', address);
      if (cb && address) {
        cb(address);
      }
      server.removeListener('error', errorListener);
      resolve();
    };
    const errorListener = (err: Error) => {
      server.removeListener('listening', listeningListener);
      reject(err);
    };

    server.once('listening', listeningListener).once('error', errorListener).listen(opts);
  });
}

function closeServer(server: net.Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
}
