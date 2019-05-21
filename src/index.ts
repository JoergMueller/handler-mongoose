import HandlerMongoose from './libs/handler';
import { activator } from './libs/types';

const handlerMongoose: HandlerMongoose = activator(HandlerMongoose);

handlerMongoose.prepare();
handlerMongoose.loadConfig();
handlerMongoose.loadModels(__dirname + '/schemas', ['ts', 'js']);
