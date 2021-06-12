export interface ListenOptions {
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
  limits?: {
    jsonBody?: string;
  };
}
