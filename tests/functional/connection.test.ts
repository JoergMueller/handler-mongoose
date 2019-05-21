import mongoose from 'mongoose';

const mockLogError = jest.fn(console.log); // tslint:disable-line: no-console
const mockLogFatal = jest.fn(console.log); // tslint:disable-line: no-console

import HandlerMongoose from '../../src/libs/handler';
import { activator } from '../../src/libs/types';

const handlerMongoose: HandlerMongoose = activator(HandlerMongoose);

jest.setTimeout(10000);

/**
 *
 */
describe('Functional Testing', () => {
  let log: any;

  /**
   *
   */
  beforeEach(() => {
    log = {
      child: () => log,
      debug: () => {}, // tslint:disable-line: no-empty
      info: () => {}, // tslint:disable-line: no-empty
      error: mockLogError,
      fatal: mockLogFatal,
    } as any;
  });

  test('it should be establishes and closes a connection when connect()', async (done) => {
    handlerMongoose
      .loadConfig()
      .connect()
      .subscribe((H: mongoose.Connection) => {
        done();
      });
  });

  /**
   *
   */
  test('it should be closes a connection when close() is called and all jobs finished', async (done) => {
    handlerMongoose
      .loadConfig()
      .connect()
      .subscribe((H: mongoose.Connection) => {
        H.close(done);
        H.close(done);
      });
  });

  test('create collection', async (done) => {
    handlerMongoose
      .loadConfig()
      .connect()
      .subscribe((H: mongoose.Connection) => {
        H.createCollection('Harry_Oscorp');
        H.close(done);
        H.close(done);
      });
  });
});
