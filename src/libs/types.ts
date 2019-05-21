import { ActivatableI, IConstructor } from './peLib';

export function activator<T extends ActivatableI>(type: IConstructor<T>): T {
  return new type();
}

/* --------------------------------------------------------------------------------- */

import EventEmitter from 'events';
import { readdirSync } from 'fs';
import mongoose from 'mongoose';
import { parse } from 'path';

export class MongooseLoader {
  dbhandler: any = undefined;
  schemapath: string = '';
  private connstr: string = '';
  private connstrE: EventEmitter = new EventEmitter();
  private schemafiles: string[] = [];

  prepare(): void {
    this.connstrE.on('load-connstr', (connstr) => {
      this.connstr = connstr;
      this.dbhandler = mongoose.createConnection(this.connstr, { useNewUrlParser: true });
      mongoose.set('useCreateIndex', true);
    });
  }

  shutDown(callback?: <P>(P?: any) => void) {
    this.dbhandler.close(true, callback || null);
  }

  isActive(): boolean {
    if (this.dbhandler.readyState === 2) return true;
    return false;
  }

  async reActivate() {
    await this.loadConfig();
    await this.loadModels(this.schemapath, ['ts', 'js']);
    return true;
  }

  loadConfig() {
    if (!process.env.DB_URI) {
      throw new Error('no parameters in env found');
      process.exit(1);
    }
    this.connstrE.emit('load-connstr', process.env.DB_URI);
  }

  async loadModels(Path: string, allowedExt: string[] = ['ts', 'js']) {
    this.schemapath = Path;
    if (undefined === this.dbhandler) {
      this.dbhandler = mongoose.createConnection(this.connstr, { useNewUrlParser: true });
      mongoose.set('useCreateIndex', true);
    }
    readdirSync(Path).forEach((file) => {
      this.schemafiles.push(file);

      const name = this.validateName(file, allowedExt);
      if (name) {
        require(Path + '/' + name).default(this.dbhandler);
      }
    });
  }

  hasModel(MName: string) {
    return undefined === this.dbhandler.modelNames()[MName] ? false : this.dbhandler.modelNames()[MName];
  }

  getModel(MName: string = '') {
    return this.hasModel(MName);
  }

  validateName(file: string, allowedExt: string[] = ['ts', 'js']): string | boolean {
    const { name, ext } = parse(file);
    if (ext.length === 0 || name.length === 0) {
      return false;
    }

    if (allowedExt.length > 0 && allowedExt.indexOf(ext.substr(1)) === -1) {
      return false;
    }
    return name;
  }
}

const mongooseLoader: MongooseLoader = activator(MongooseLoader);
export default mongooseLoader;
