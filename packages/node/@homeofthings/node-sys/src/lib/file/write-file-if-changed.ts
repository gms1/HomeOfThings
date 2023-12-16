import { promises as fsNode } from 'node:fs';
import * as path from 'path';

import { mkdir } from '../fs';

export async function writeFileIfChanged(outputPath: string, content: string): Promise<boolean> {
  let oldContent;
  try {
    oldContent = await fsNode.readFile(outputPath, { encoding: 'utf8' });
  } catch (err) {
    oldContent = undefined;
  }
  if (oldContent === content) {
    return false;
  }
  const dirname = path.dirname(outputPath);
  try {
    await mkdir(dirname, { recursive: true });
    await fsNode.writeFile(outputPath, content, { encoding: 'utf8' });
  } catch (err) {
    return Promise.reject(err);
  }
  return true;
}
