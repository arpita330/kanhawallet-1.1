const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const otpStore = require('../routes/otp').otpStore;

// Register
router.post('/register', async (req, res) => {
  try{
    const { username, fullName, mobile, telegramId, password, otp } = req.body;
    if(!username || !fullName || !mobile || !telegramId || !password || !otp)
      return res.status(400).json({ error: 'Aʟʟ Fɪᴇʟᴅs RᴇQᴜɪʀᴇᴅ' });

    // OTP verification
    const record = otpStore.get(mobile);
    if(!record || record.otp != otp || record.expires < Date.now())
      return res.status(400).json({ error: 'Iɴᴠᴀʟɪᴅ Oᴛᴘ' });
    otpStore.delete(mobile);

    // Unique checks
    if(await User.findOne({ username })) return res.status(400).json({ error: 'Usᴇʀɴᴀᴍᴇ Aʟʀᴇᴀᴅʏ Tᴀᴋᴇɴ' });
    if(await User.findOne({ fullName })) return res.status(400).json({ error: 'Fᴜʟʟ Nᴀᴍᴇ Aʟʀᴇᴀᴅʏ Tᴀᴋᴇɴ' });
    if(await User.findOne({ mobile })) return res.status(400).json({ error: 'Mᴏʙɪʟᴇ Aʟʀᴇᴀᴅʏ Rᴇɢɪsᴛᴇʀᴇᴅ' });
    if(await User.findOne({ telegramId })) return res.status(400).json({ error: 'Tᴇʟᴇɢʀᴀᴍ Iᴅ Aʟʀᴇᴀᴅʏ Rᴇɢɪsᴛᴇʀᴇᴅ' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, fullName, mobile, telegramId, password:hashed });
    const token = jwt.sign({ id:user._id }, process.env.JWT_SECRET, { expiresIn:'30d' });

    res.json({ success:true, message:`Rᴇɢɪsᴛʀᴀᴛɪᴏɴ Sᴜᴄᴄᴇssғᴜʟʟʏ`, token, user:{ username:user.username, fullName:user.fullName, mobile:user.mobile, balance:user.balance }});
  } catch(e){
    res.status(500).json({ error: e.message });
  }
});

// Login
router.post('/login', async (req,res)=>{
  try{
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if(!user) return res.status(400).json({ error:'Usᴇʀɴᴀᴍᴇ Nᴏᴛ Fᴏᴜɴᴅ' });
    if(user.isBlocked) return res.status(403).json({ error:'Aᴄᴄᴏᴜɴᴛ Bʟᴏᴄᴋᴇᴅ' });

    const match = await bcrypt.compare(password, user.password);
    if(!match) return res.status(400).json({ error:'Wʀᴏɴɢ Pᴀssᴡᴏʀᴅ' });

    const token = jwt.sign({ id:user._id }, process.env.JWT_SECRET, { expiresIn:'30d' });
    res.json({ success:true, token, message:`Lᴏɢɪɴ Sᴜᴄᴄᴇssғᴜʟʟʏ`, user:{ username:user.username, fullName:user.fullName, balance:user.balance }});
  } catch(e){
    res.status(500).json({ error:e.message });
  }
});

module.exports = router;
