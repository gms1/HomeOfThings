import { promises as fsNode } from 'node:fs';
import * as path from 'node:path';

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
  if (!oldContent) {
    const outputDir = path.dirname(outputPath);
    await fsNode.mkdir(outputDir, { recursive: true });
  }
  await fsNode.writeFile(outputPath, content, { encoding: 'utf8' });
  return true;
}
