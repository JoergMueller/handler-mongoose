# Mongoose Handler


Generate Variable: `mongooseLoader`

```javascript
import dotenv from 'dotenv';
import mongooseLoader from './libs/types';

dotenv.config();

mongooseLoader.prepare();
mongooseLoader.loadConfig();
mongooseLoader.loadModels(__dirname + '/schemas', ['ts', 'js']);

var query = Model('ExternalRatings').find({});

query
  .where('ratingCount')
  .gte(10)
  .lte(100)
  .where('status')
  .eq('active')
  .limit(10)
  .sort('-url')
  .exec(callback);
```

Mongoose has many pre defined function:

```javascript
var Model = handlerMongoose.handler.model('ExternalRatings');

Model.deleteMany();
Model.deleteOne();
Model.find();
Model.findById();
Model.findByIdAndDelete();
Model.findByIdAndRemove();
Model.findByIdAndUpdate();
Model.findOne();
Model.findOneAndDelete();
Model.findOneAndRemove();
Model.findOneAndUpdate();
Model.replaceOne();
Model.updateMany();
Model.updateOne();
```
