import { readdirSync } from 'fs';
import { parse } from 'path';

import mongoose from 'mongoose';

/**
 * Return a schema list
 */
export function loadSchemas(path: string, allowedExt: string[], handler: any) {
  const files = readdirSync(path);

  return new Map(
    files
      .map((file) => getName(file, allowedExt))
      .filter((name): name is string => !!name)
      .map<[string, mongoose.Schema]>((name) => [name, require(path + '/' + name).default(handler)]),
  );
}

/**
 *
 * @param file
 * @param allowedExt
 */
export function getName(file: string, allowedExt: string[]) {
  const { name, ext } = parse(file);

  if (ext.length === 0 || name.length === 0) {
    return undefined;
  }

  if (allowedExt.length > 0 && allowedExt.indexOf(ext.substr(1)) === -1) {
    return undefined;
  }

  return name;
}
