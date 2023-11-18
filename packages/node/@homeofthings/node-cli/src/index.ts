import { logOpen, logImportant, pipe, exec, sh, logInfo, nohupExec, nohupPipe, nohupSh, logClose, logWarn, logError, which } from '@homeofthings/node-shell';

async function main() {
  let output: string[] = [];
  logOpen('index.log');
  logImportant('`pipe` using `exec` should print "hello": ');
  await pipe(exec('echo', 'hello')).to(exec('grep', 'el')).run();
  logImportant('`pipe` using `sh` should print "hello": ');
  await pipe(sh('echo hello')).to(sh('grep el')).run();
  logImportant('`exec` should have no output: ');
  await exec('ls', '-l', '.').setQuiet().run();
  logImportant('`exec` should echo and log to stdout: ');
  await exec('ls', '-l', '.').run();
  logImportant('`exec` should log to stderr and succeed although command failed: ');
  await exec('ls', '-l', 'xx x').set('ignoreExitCode', true).run();
  logImportant('`exec` should succeed although command failed and should not have any output: ');
  await exec('ls', '-l', 'xx x').setQuiet().setIgnoreExitCode().run();
  logImportant('`sh` should echo and log to stdout: ');
  await sh('ls -l "README.md"').run();
  logImportant('read script from string and write output into variable');
  await exec('bash')
    .setStdIn(
      `
     echo -n 'hello'
     echo -n ' '
     echo 'world'
     `,
    )
    .setStdOut(output)
    .run();
  logInfo('output:');
  logInfo(output.join('\n'));
  logImportant('`nohup` should echo but should not log to stdout');
  await nohupExec('bash')
    .setStdIn(
      `
      sleep 2m
      echo end
    `,
    )
    .run();

  logImportant('`nohupPipe` should echo but should not log to stdout');
  await nohupPipe(nohupExec('echo', 'hello')).to(nohupSh('sleep 2m && grep el')).run();

  logImportant('`which -a ls` should echo and write output into variable');
  output = await which({ all: true }, 'ls');
  logInfo('output:');
  logInfo(output.join('\n'));

  logImportant('end of main');
  logClose();
}

(async () => {
  try {
    await main();
    logImportant('succeeded');
  } catch (err) {
    if ((err as Error)?.message) {
      logWarn((err as Error)?.message);
    }
    logError('failed');
  }
})();
