require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();

// Middleware
const { sanitizeInput, rateLimiter } = require('./middleware/security');
app.use(express.json());
app.use(sanitizeInput);
app.use(rateLimiter);

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/wallet', require('./routes/wallet'));
app.use('/transfer', require('./routes/transfer'));
app.use('/lifafa', require('./routes/lifafa'));
app.use('/otp', require('./routes/otp'));

// Serve frontend
app.use(express.static('public'));

// Connect MongoDB & Start Server
mongoose.connect(process.env.MONGO_URI)
  .then(()=> app.listen(process.env.PORT || 3000, ()=> console.log('Sᴇʀᴠᴇʀ Rᴜɴɴɪɴɢ')))
  .catch(err => console.error(err));
