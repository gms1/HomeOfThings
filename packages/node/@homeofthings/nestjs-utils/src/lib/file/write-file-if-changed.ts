import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import * as path from 'path';
import * as util from 'util';

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

export async function writeFileIfChanged(outputPath: string, content: string): Promise<boolean> {
  let oldContent;
  try {
    oldContent = await readFile(outputPath, { encoding: 'utf8' });
  } catch (err) {
    oldContent = undefined;
  }
  if (oldContent === content) {
    return false;
  }
  const dirname = path.dirname(outputPath);
  try {
    mkdirp.sync(dirname);
    await writeFile(outputPath, content, { encoding: 'utf8' });
  } catch (err) {
    return Promise.reject(err);
  }
  return true;
}
