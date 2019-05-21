const mockLogError = jest.fn(console.log); // tslint:disable-line: no-console
const mockLogFatal = jest.fn(console.log); // tslint:disable-line: no-console

import dotenv from 'dotenv';
import mongooseLoader from './../../src/libs/types';
dotenv.config();

mongooseLoader.prepare();
mongooseLoader.loadConfig();
mongooseLoader.loadModels(__dirname + '/../../src/schemas', ['ts', 'js']);

jest.setTimeout(30000);

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

  test('it should be establishes and readyState = 2', async (done) => {
    expect(mongooseLoader.dbhandler.readyState).toBe(2);
    done();
  });

  test('create collection and remove', async (done) => {
    console.log(mongooseLoader.dbhandler.createCollection);

    await mongooseLoader.dbhandler.createCollection('myCollection_' + Date.now()).then((collection: any) => {
      collection.drop();
      done();
    });
  });

  test('update entry', async (done) => {
    const Model = mongooseLoader.dbhandler.model('ExternalRatings');
    let query = Model.findOne({ service: 'finanzen', user: '57b46782cf79599f6adc007a' });

    await query.exec((error: any, document: any) => {
      if (error) {
        throw new Error(error.toString());
      }

      document.ratingCount++;
      document.ratingValue += 4;
      document.errorCount = 122;

      document.save();
      done();
    });
  });

  test('shutdown database connection', async (done) => {
    mongooseLoader.shutDown(done);
  });

  test('reactivate', async (done) => {
    if (mongooseLoader.isActive() === false) {
      await mongooseLoader.reActivate();
    }

    const Model = mongooseLoader.dbhandler.model('ExternalRatings');
    let query = Model.findOne({ service: 'finanzen' });

    await query.exec((error: any, document: any) => {
      if (error) {
        throw new error();
      }
      console.log(document);
      expect(document.ratingCount).toStrictEqual(document.ratingCount);
      expect(document.service).toStrictEqual('finanzen');

      mongooseLoader.shutDown(done);
    });
  });

  test('it should be closes a connection all jobs finished', async (done) => {
    if (mongooseLoader.dbhandler.readyState === 2) {
      mongooseLoader.dbhandler.close(true, done);
    } else {
      done();
    }
  });
});
