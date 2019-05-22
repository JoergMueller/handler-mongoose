import mongoose from 'mongoose';

const noRatingData = {
  rating: { type: Number },
  error: { type: String },
  created: { type: Date, default: Date.now },
};

const preSchema = {
  created: { type: Date, default: Date.now },
  service: { type: String },
  errors: {
    noRatingData: [noRatingData],
  },
};

const RatingsExternalErrors = (handler: any) => {
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
    collection: 'ratings_external_errors',
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

  handler.model('RatingsExternalErrors', Schema);
  return Schema;
};

export default RatingsExternalErrors;
