import HandlerMongoose from './libs/handler';
import { loadSchemas } from './libs/helper';
import { activator } from './libs/types';

const handlerMongoose: HandlerMongoose = activator(HandlerMongoose);

handlerMongoose.prepare();
handlerMongoose.loadConfig();

loadSchemas(__dirname + '/schemas', ['ts', 'js'], handlerMongoose.handler);
