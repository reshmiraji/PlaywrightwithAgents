import fs from 'fs';
import path from 'path';

/**
 * Read a JSON file and return a parsed payload object.
 * - filePath may be absolute or relative to the repository root (process.cwd()).
 */
export default function loadJsonPayload(filePath: string): any {
  const abs = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
  if (!fs.existsSync(abs)) {
    throw new Error(`loadJsonPayload: file not found: ${abs}`);
  }
  const raw = fs.readFileSync(abs, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (e) {
    throw new Error(`loadJsonPayload: failed to parse JSON file ${abs}`);
  }
}
