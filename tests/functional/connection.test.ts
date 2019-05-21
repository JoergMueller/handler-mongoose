const mockLogError = jest.fn(console.log); // tslint:disable-line: no-console
const mockLogFatal = jest.fn(console.log); // tslint:disable-line: no-console

import HandlerMongoose from '../../src/libs/handler';
import { activator } from '../../src/libs/types';

const handlerMongoose: HandlerMongoose = activator(HandlerMongoose);

handlerMongoose.prepare();
handlerMongoose.loadConfig();
handlerMongoose.loadModels(__dirname + '/../../src/schemas', ['ts', 'js']);

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
    expect(handlerMongoose.handler.readyState).toBe(2);
    done();
  });

  test('create collection and remove', async (done) => {
    await handlerMongoose.handler.createCollection('myCollection_' + Date.now()).then((collection: any) => {
      collection.drop();
      done();
    });
  });

  test('update entry', async (done) => {
    const Model = handlerMongoose.handler.model('ExternalRatings');
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
    handlerMongoose.shutDown(done);
  });

  test('reactivate', async (done) => {
    if (handlerMongoose.isActive() === false) {
      await handlerMongoose.reActivate();
    }

    const Model = handlerMongoose.handler.model('ExternalRatings');
    let query = Model.findOne({ service: 'finanzen' });

    await query.exec((error: any, document: any) => {
      if (error) {
        throw new error();
      }
      console.log(document);
      expect(document.ratingCount).toStrictEqual(document.ratingCount);
      expect(document.service).toStrictEqual('finanzen');

      handlerMongoose.shutDown(done);
    });
  });

  test('it should be closes a connection all jobs finished', async (done) => {
    if (handlerMongoose.handler.readyState === 2) {
      handlerMongoose.handler.close(true, done);
    } else {
      done();
    }
  });
});
