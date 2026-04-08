const mongoose = require('mongoose');

const txnSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref:'User' },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref:'User' },
  amount: { type: Number, required:true },
  type: { type: String, required:true },
  status: { type: String, default:'success' },
  note: String,
  txnId: String
},{ timestamps:true });

module.exports = mongoose.model('Transaction', txnSchema);
