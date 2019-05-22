import dotenv from 'dotenv';
import mongooseLoader from './../src/schemas';
dotenv.config();

mongooseLoader.prepare();
mongooseLoader.loadConfig();
mongooseLoader.loadModels(mongooseLoader, ['ts', 'js']);

jest.setTimeout(30000);
