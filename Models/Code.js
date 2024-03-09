const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const codeSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    minlength: 6,
    maxlength: 6,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: function () {
      return new Date(this.createdAt.getTime() + 60 * 1000);
    }
  },
});

codeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("VerfCode", codeSchema);
