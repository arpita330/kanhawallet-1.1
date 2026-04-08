const rateLimiters = new Map();

// Input Sanitization Middleware
function sanitizeInput(req, res, next) {
  const sanitize = str => String(str).replace(/[^a-zA-Z0-9 @.+_-]/g, '');
  
  if(req.body){
    for(const key in req.body){
      req.body[key] = sanitize(req.body[key]);
    }
  }
  if(req.query){
    for(const key in req.query){
      req.query[key] = sanitize(req.query[key]);
    }
  }
  next();
}

// Simple Rate Limiter to Block Suspicious Activities
function rateLimiter(req, res, next){
  const ip = req.ip;
  const now = Date.now();
  const windowTime = 60000; // 1 min
  const maxRequests = 10;

  if(!rateLimiters.has(ip)){
    rateLimiters.set(ip, []);
  }

  const timestamps = rateLimiters.get(ip).filter(t => now - t < windowTime);
  timestamps.push(now);
  rateLimiters.set(ip, timestamps);

  if(timestamps.length > maxRequests){
    return res.status(429).json({ error: 'Sᴜsᴘɪᴄɪᴏᴜs Aᴄᴛɪᴠɪᴛʏ Dᴇᴛᴇᴄᴛᴇᴅ. Pʟᴇᴀsᴇ Tʀʏ Aɢᴀɪɴ Lᴀᴛᴇʀ.' });
  }

  next();
}

module.exports = { sanitizeInput, rateLimiter };
