require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());

// 🌟 Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/lifafa', require('./routes/lifafa'));

// 🌟 MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('💾 Dᴀᴛᴀʙᴀsᴇ Cᴏɴɴᴇᴄᴛᴇᴅ'))
  .catch(err => console.log(err));

// 🌟 Export App for Vercel
module.exports = app;

// Optional for local testing
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`🚀 Sᴇʀᴠᴇʀ Rᴜɴɴɴɪɴɢ Oɴ Pᴏʀᴛ ${PORT}`));
}
