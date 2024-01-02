# TODOs

- support for reloading config using 'SIGHUP'

https://www.npmjs.com/package/config-reloadable

- support for docker secrets

https://github.com/lee5i3/config-secrets

but not sure if the secrets should be really be added to the global 'config'
and I do not like to be forced to configure a 'custom-environment-variables' file in the config folder

maybe we should provide something (outside of this module?) that may use our ConfigService for getting default values, just if the secret is not defined

- schema validation

  using ajv or ToolBox ?
