const router = require('express').Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Lifafa = require('../models/Lifafa');
const Transaction = require('../models/Transaction');
const { v4: uuidv4 } = require('uuid');

// Create Lifafa
router.post('/create', auth, async (req, res) => {
  try {
    const { totalAmount, maxClaims, note } = req.body;
    if (!totalAmount || !maxClaims) return res.status(400).json({ error: 'Tᴏᴛᴀʟ Aᴍᴏᴜɴᴛ Aɴᴅ Mᴀx Cʟᴀɪᴍs RᴇQᴜɪʀᴇᴅ' });

    const user = await User.findById(req.user._id);
    if (user.balance < totalAmount) return res.status(400).json({ error: 'Iɴsᴜғғɪᴄɪᴇɴᴛ Bᴀʟᴀɴᴄᴇ' });

    const perAmount = Math.floor(totalAmount / maxClaims);

    user.balance -= totalAmount;
    await user.save();

    const lifafa = await Lifafa.create({
      createdBy: user._id,
      totalAmount,
      perAmount,
      maxClaims,
      code: uuidv4().replace(/-/g,'').slice(0,8).toUpperCase(),
      note: note || 'Lɪғᴀғᴀ'
    });

    res.json({ 
      success: true, 
      code: lifafa.code, 
      perAmount, 
      message: `Lɪғᴀғᴀ Cʀᴇᴀᴛᴇᴅ! Eᴀᴄʜ Pᴇʀsᴏɴ Gᴇᴛs ₹${perAmount}` 
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Claim Lifafa
router.post('/claim', auth, async (req, res) => {
  try {
    const { code } = req.body;
    const lifafa = await Lifafa.findOne({ code });
    if (!lifafa) return res.status(404).json({ error: 'Lɪғᴀғᴀ Nᴏᴛ Fᴏᴜɴᴅ' });
    if (lifafa.expired) return res.status(400).json({ error: 'Lɪғᴀғᴀ Eхᴘɪʀᴇᴅ' });
    if (lifafa.claimed.find(c => c.user.toString() === req.user._id.toString()))
      return res.status(400).json({ error: 'Aʟʀᴇᴀᴅʏ Cʟᴀɪᴍᴇᴅ' });
    if (lifafa.claimed.length >= lifafa.maxClaims)
      return res.status(400).json({ error: 'Lɪғᴀғᴀ Fᴜʟʟʏ Cʟᴀɪᴍᴇᴅ' });

    lifafa.claimed.push({ user: req.user._id, at: new Date() });
    if (lifafa.claimed.length >= lifafa.maxClaims) lifafa.expired = true;
    await lifafa.save();

    const user = await User.findById(req.user._id);
    user.balance += lifafa.perAmount;
    await user.save();

    await Transaction.create({
      receiver: user._id,
      amount: lifafa.perAmount,
      type: 'lifafa',
      status: 'success',
      txnId: uuidv4().replace(/-/g,'').slice(0,12).toUpperCase(),
      note: `Lɪғᴀғᴀ Cʟᴀɪᴍᴇᴅ: ${code}`
    });

    res.json({ 
      success: true, 
      amount: lifafa.perAmount, 
      message: `Yᴏᴜ Gᴏᴛ ₹${lifafa.perAmount} Fʀᴏᴍ Lɪғᴀғᴀ!` 
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
