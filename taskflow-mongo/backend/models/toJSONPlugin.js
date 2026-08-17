// ============================================================
// Mongoose plugin: reshape documents so the frontend (built for
// MySQL-style rows) keeps working unchanged.
// - _id (ObjectId)  -> id (string)
// - createdAt        -> created_at
// - removes __v, updatedAt
// ============================================================
module.exports = function toJSONPlugin(schema) {
  schema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      if (ret.createdAt) {
        ret.created_at = ret.createdAt;
        delete ret.createdAt;
      }
      delete ret.updatedAt;
      return ret;
    }
  });
};
