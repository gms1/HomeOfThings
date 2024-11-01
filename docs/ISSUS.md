# ISSUES

## build issues

- tried to convert rollup to inferred

  ```bash
    gms@sirius:~/gms/projects/hot/HomeOfThings (master)$ npx nx g convert-to-inferred
  ✔ Which generator would you like to use? · @nx/rollup:convert-to-inferred

  NX  Generating @nx/rollup:convert-to-inferred

  CREATE packages/js/jsonpointerx/rollup.config.js
  UPDATE packages/js/jsonpointerx/project.json
  UPDATE nx.json
  gms@sirius:~/gms/projects/hot/HomeOfThings (master *)$ npx nx reset

  NX   Resetting the Nx cache and stopping the daemon.

  NX   Successfully reset the Nx workspace.

  gms@sirius:~/gms/projects/hot/HomeOfThings (master *)$ npm run jsonpointerx:build
  npm ERR! Missing script: "jsonpointerx:build"
  npm ERR! 
  npm ERR! To see a list of scripts, run:
  npm ERR!   npm run

  npm ERR! A complete log of this run can be found in: /home/gms/.npm/_logs/2024-11-01T06_14_22_767Z-debug-0.log
  ```

- tried to convert jest to inferred

  - the current directory for running the tests changed from the workspace root to the projects root.
  - many sqlite3 test dbs are showing up in the project roots after running the test
  - needs more testing
    - if `npx jest` keeps working
    - if coverage keeps working for single project and whole workspace

## TODOs

- check [Manage Releases](https://nx.dev/features/manage-releases)
