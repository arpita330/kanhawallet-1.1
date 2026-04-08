const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, unique:true, required:true },
  fullName: { type: String, unique:true, required:true },
  mobile: { type: String, unique:true, required:true },
  telegramId: { type: String, unique:true, required:true },
  password: { type: String, required:true },
  balance: { type: Number, default: 0 },
  isBlocked: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  apiKey: String
},{ timestamps:true });

module.exports = mongoose.model('User', userSchema);
