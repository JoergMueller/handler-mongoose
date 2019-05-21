import dotenv from 'dotenv';
import EventEmitter from 'events';
import { readdirSync } from 'fs';
import mongoose from 'mongoose';
import { parse } from 'path';

export default class HandlerMongoose {
  handler: any;
  modelpath: string = '';
  modelarray: string[] = [];
  private cstr: string = '';
  private connectStringE: EventEmitter = new EventEmitter();

  async prepare() {
    this.connectStringE.on('config-loaded', (cstr: string) => {
      this.cstr = cstr;
      this.handler = mongoose.createConnection(this.cstr, { useNewUrlParser: true });
      mongoose.set('useCreateIndex', true);
    });
  }

  loadModels(P: string, E: string[]): boolean {
    this.modelpath = P;
    this.modelarray = readdirSync(this.modelpath);
    for (var F of this.modelarray) {
      const name = this.validateName(F, E);
      if (name) {
        require(P + '/' + name).default(this.handler);
      }
    }
    return true;
  }

  validateName(file: string, allowedExt: string[]): string | boolean {
    const { name, ext } = parse(file);
    if (ext.length === 0 || name.length === 0) {
      return false;
    }

    if (allowedExt.length > 0 && allowedExt.indexOf(ext.substr(1)) === -1) {
      return false;
    }
    return name;
  }

  shutDown(callback?: <P>(P?: any) => void) {
    this.handler.close(true, callback || null);
  }

  isActive(): boolean {
    if (this.handler.readyState === 2) return true;
    return false;
  }

  async reActivate() {
    await this.loadConfig();
    await this.loadModels(this.modelpath, ['ts', 'js']);
    return true;
  }

  loadConfig(options: object = {}) {
    dotenv.config(options);

    const DB_URI = process.env.DB_URI;
    if (undefined === DB_URI) {
      throw new Error('could not find DB_URI in env');
    } else {
      this.cstr = DB_URI;
      this.connectStringE.emit('config-loaded', DB_URI);
    }
    return this;
  }
}
