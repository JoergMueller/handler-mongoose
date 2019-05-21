import dotenv from 'dotenv';
import EventEmitter from 'events';
import mongoose from 'mongoose';
import { Observable } from 'rxjs-observable';

export default class HandlerMongoose {
  handler: any;
  private cstr: string = '';
  private connectStringE: EventEmitter = new EventEmitter();

  prepare() {
    this.connectStringE.on('load', (cstr: string) => {
      this.cstr = cstr;

      this.connect().subscribe((handler: any) => {
        this.handler = handler;
        mongoose.set('useCreateIndex', true);
      });
    });
  }

  connect() {
    return new Observable((observer) => {
      if (this.cstr.length > 0) {
        let handler = mongoose.createConnection(this.cstr, { useNewUrlParser: true });
        this.handler = handler;
        observer.next(handler);
        observer.complete();
      } else {
        this.loadConfig();
      }
    });
  }

  loadConfig(options: object = {}) {
    dotenv.config(options);

    const DB_URI = process.env.DB_URI;
    if (undefined === DB_URI) {
      throw new Error('could not find DB_URI in env');
    } else {
      this.cstr = DB_URI;
      this.connectStringE.emit('load', DB_URI);
    }

    return this;
  }
}
