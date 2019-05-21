import dotenv from 'dotenv';
import mongooseLoader from './libs/types';

dotenv.config();

mongooseLoader.prepare();
mongooseLoader.loadConfig();
mongooseLoader.loadModels(__dirname + '/schemas', ['ts', 'js']);
