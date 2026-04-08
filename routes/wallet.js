const router = require('express').Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { v4: uuidv4 } = require('uuid');

// Get Balance
router.get('/balance', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('fullName username mobile balance');
    res.json({ success: true, message: `Yᴏᴜʀ Cᴜʀʀᴇɴᴛ Bᴀʟᴀɴᴄᴇ ɪs ₹${user.balance}`, balance: user.balance });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Transaction History
router.get('/transactions', auth, async (req, res) => {
  try {
    const txns = await Transaction.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }]
    }).sort({ createdAt: -1 }).limit(50).populate('sender receiver', 'fullName username mobile');
    res.json({ success: true, message: `Lᴀsᴛ 50 Tʀᴀɴsᴀᴄᴛɪᴏɴs`, transactions: txns });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Deposit Request (User initiates)
router.post('/deposit', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount < 1) return res.status(400).json({ error: 'Aᴍᴏᴜɴᴛ Mᴜsᴛ Bᴇ ɢʀᴇᴀᴛᴇʀ Tʜᴀɴ 0' });

    const txn = await Transaction.create({
      receiver: req.user._id,
      amount,
      type: 'deposit',
      status: 'pending',
      txnId: uuidv4().replace(/-/g,'').slice(0,12).toUpperCase(),
      note: 'Dᴇᴘᴏsɪᴛ RᴇQᴜᴇsᴛ'
    });

    res.json({ success: true, message: `Dᴇᴘᴏsɪᴛ RᴇQᴜᴇsᴛ Sᴜᴄᴄᴇssғᴜʟʟʏ Sᴜʙᴍɪᴛᴛᴇᴅ`, txnId: txn.txnId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Withdraw Request
router.post('/withdraw', auth, async (req, res) => {
  try {
    const { amount, upiId } = req.body;
    if (!amount || amount < 1) return res.status(400).json({ error: 'Aᴍᴏᴜɴᴛ Mᴜsᴛ Bᴇ ɢʀᴇᴀᴛᴇʀ Tʜᴀɴ 0' });
    if (!upiId) return res.status(400).json({ error: 'Uᴘɪ Iᴅ RᴇQᴜɪʀᴇᴅ' });

    const user = await User.findById(req.user._id);
    if (user.balance < amount) return res.status(400).json({ error: 'Iɴsᴜғғɪᴄɪᴇɴᴛ Bᴀʟᴀɴᴄᴇ' });

    user.balance -= amount;
    await user.save();

    const txn = await Transaction.create({
      sender: req.user._id,
      amount,
      type: 'withdraw',
      status: 'pending',
      txnId: uuidv4().replace(/-/g,'').slice(0,12).toUpperCase(),
      note: `Wɪᴛʜᴅʀᴀᴡ Tᴏ Uᴘɪ: ${upiId}`
    });

    res.json({ success: true, message: `Wɪᴛʜᴅʀᴀᴡ RᴇQᴜᴇsᴛ Sᴜᴄᴄᴇssғᴜʟʟʏ Sᴜʙᴍɪᴛᴛᴇᴅ`, txnId: txn.txnId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
