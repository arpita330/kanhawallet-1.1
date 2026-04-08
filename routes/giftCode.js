const router = require('express').Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const GiftCode = require('../models/GiftCode');
const Transaction = require('../models/Transaction');
const { v4: uuidv4 } = require('uuid');

// Redeem Gift Code
router.post('/redeem', auth, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Cᴏᴅᴇ RᴇQᴜɪʀᴇᴅ' });

    const gift = await GiftCode.findOne({ code });
    if (!gift) return res.status(404).json({ error: 'Iɴᴠᴀʟɪᴅ Gɪғᴛ Cᴏᴅᴇ' });
    if (gift.expired) return res.status(400).json({ error: 'Cᴏᴅᴇ Eхᴘɪʀᴇᴅ' });
    if (gift.usedBy.includes(req.user._id)) return res.status(400).json({ error: 'Aʟʀᴇᴀᴅʏ Rᴇᴅᴇᴇᴍᴇᴅ' });
    if (gift.usedBy.length >= gift.maxUses) {
      gift.expired = true;
      await gift.save();
      return res.status(400).json({ error: 'Cᴏᴅᴇ Fᴜʟʟʏ Uѕᴇᴅ' });
    }

    // Add user to usedBy list
    gift.usedBy.push(req.user._id);
    if (gift.usedBy.length >= gift.maxUses) gift.expired = true;
    await gift.save();

    // Update user balance
    const user = await User.findById(req.user._id);
    user.balance += gift.amount;
    await user.save();

    // Log transaction
    await Transaction.create({
      receiver: user._id,
      amount: gift.amount,
      type: 'gift',
      status: 'success',
      txnId: uuidv4().replace(/-/g,'').slice(0,12).toUpperCase(),
      note: `Gɪғᴛ Cᴏᴅᴇ Rᴇᴅᴇᴇᴍᴇᴅ: ${code}`
    });

    res.json({
      success: true,
      amount: gift.amount,
      message: `₹${gift.amount} Aᴅᴅᴇᴅ Tᴏ Wᴀʟʟᴇᴛ!`
    });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
