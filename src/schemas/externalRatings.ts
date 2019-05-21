import mongoose from 'mongoose';

const history = {
  ratingValue: { type: Number },
  ratingCount: { type: Number },
  lastRatingDate: { type: Date },
  created: { type: Date },
};

const preSchema = {
  created: { type: Date, default: null },
  errorCount: { type: Number, default: 0 },
  history: [history],
  lastRatingDate: { type: Date, default: null },
  modified: { type: Date, default: Date.now },
  ratingCount: { type: Number, index: true, default: 0 },
  ratingValue: { type: Number, index: true, default: 0 },
  service: { type: String, index: true },
  status: { type: ['inactive', 'active', 'newService', 'new'], default: 'new' },
  url: { type: String, index: true },
  oldUrl: { type: String, index: true },
  user: { type: String, default: '' },
  prevStatus: { type: String },
  deactivationDate: { type: Date, default: null },
};

const ExternalRatings = (handler: any) => {
  const Schema = new mongoose.Schema(preSchema, {
    toObject: {
      getters: true,
      virtuals: true,
      transform: (doc, ret, options) => {
        delete ret._id;
        return ret;
      },
    },
    toJSON: {
      getters: true,
      virtuals: true,
    },
    collection: 'ratings_external',
  });

  Schema.virtual('id').get((self: any) => {
    return self._id;
  });

  Schema.post('init', (doc) => {
    return '%s has been initialized from the db ' + doc._id;
  });
  Schema.post('validate', (doc) => {
    return '%s has been validated (but not saved yet) ' + doc._id;
  });
  Schema.post('save', (doc) => {
    return '%s has been saved ' + doc._id;
  });
  Schema.post('remove', (doc) => {
    return '';
  });

  handler.model('ExternalRatings', Schema);
  return Schema;
};

export default ExternalRatings;
