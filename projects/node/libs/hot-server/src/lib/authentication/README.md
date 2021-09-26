# Authentication

the use case for this module is a typical home server/gateway
It is based on [express session](https://www.npmjs.com/package/express-session) and [passport](https://www.npmjs.com/package/passport)

## security considerations

### express session

please see https://supertokens.io/blog/express-session-vs-supertokens-for-handling-user-sessions?ref=hackernoon.com

- Brute force: express-session uses long length tokens to mitigate this attack

- Session fixation: Session fixation can be prevented by changing the auth tokens upon successful user login. Since we have set `saveUninitialized` to `false` this will be already enforced

- Token theft / Session hijacking

  this cannot be prevented since tokens are sent to and from untrusted client devices and possibly via untrusted HTTPS proxies. Even the proposed use of rolling request tokens cannot prevent or detect token teft.
  We are making token theft harder, by

  - using HttpOnly cookies, to disallow JavaScript to read them, to prevent token theft via Cross-site scripting (XSS)
  - using HTTPS, to prevent Man in the middle as long as no untrusted HTTPS proxy is in use
  - implemented token theft detection: verifying that the IP of the follow-up request matches the IP of the the initial connection
  
> TODO: implement theft detection based on IP

- Data theft from database: express-session stores all session IDs in plain text. If an attacker get hold of the database and the cookie signing key, it could hijack the sessions of all current logged in users

the IP based token theft detection may make this harder

- Scalability: because of our use case we can expect a small number of user sessions

TODO: we may want to implement a cachable sqlite3 store
TODO: we may want to cache the users to avoid reading the user information an each request (see LocalSerializer)

- Reliability and Correctness

> NOTE: express-session only has a `set` call to the store, while an explicit insert vs. update would solve
<!-- -->
> TODO: we may want to implement soft-delete for our sqlite3 store

### passport local

- Brute force user password

> TODO: implement a kind of rate limit for password login
please see [User/Password Authentication Rate Limits](https://auth0.com/docs/support/policies/rate-limit-policy/database-connections-rate-limits)
<!-- -->
> TODO: implement a kind of two-factor authentication (e.g verify new devices by email/sms )


[Suspicious IP Throttling](https://auth0.com/docs/configure/attack-protection/suspicious-ip-throttling)

wenn wir die Authentication speziell drosseln, dann kann @nestjs/throttler als globales Rate Limit verwendet werden

> TODO: enforce password complexity and lifetime

### user responsibility

- Users should avoid connecting from public client devices
- Users should avoid connecting via public HTTPS proxy
- Users should always loggout from public client devices or when using a public HTTPS proxy
- Users should either logout or lock their private client devices when leaving
