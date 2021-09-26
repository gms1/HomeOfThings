export interface AuthenticationSessionOptions {
  secret?: string | string[];
  name?: string;
  maxAge?: number;
  domain?: string;
  path?: string;
}

export interface AuthenticationModuleOptions {
  bcryptRounds?: number;
  session?: AuthenticationSessionOptions;
}
