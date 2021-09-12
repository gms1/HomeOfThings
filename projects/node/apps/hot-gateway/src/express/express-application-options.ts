export interface ExpressApplicationOptions {
  address?: string; // listening address
  http?: {
    port?: number;
    maxHeaderSize?: number;
    disabled?: boolean;
    redirect?: boolean;
    redirectCode?: number; // default: 307
    redirectLocation?: string;
  };
  https?: {
    port?: number;
    key?: string;
    cert?: string;
    maxHeaderSize?: number;
    disabled?: boolean;
  };
  trustProxy?: string;
  session: {
    name: string;
    secret: string | string[];
    maxAge: number;
  };
  limits?: {
    jsonBody?: string;
  };
}
