const router = require('express').Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { v4: uuidv4 } = require('uuid');

// URL: /api/payment?apikey=USER_API_KEY&mobile=RECEIVER_NUMBER&amount=AMOUNT
router.get('/', async (req, res) => {
  try {
    const { apikey, mobile, amount } = req.query;

    if (!apikey || !mobile || !amount)
      return res.status(400).json({ error: 'AᴘɪKᴇʏ Mᴏʙɪʟᴇ Aɴᴅ Aᴍᴏᴜɴᴛ RᴇQᴜɪʀᴇᴅ' });

    const amt = Number(amount);
    if (isNaN(amt) || amt < 1)
      return res.status(400).json({ error: 'Iɴᴠᴀʟɪᴅ Aᴍᴏᴜɴᴛ' });

    const sender = await User.findOne({ apiKey: apikey });
    if (!sender) return res.status(401).json({ error: 'Iɴᴠᴀʟɪᴅ AᴘɪKᴇʏ' });
    if (sender.isBlocked) return res.status(403).json({ error: 'Aᴄᴄᴏᴜɴᴛ Bʟᴏᴄᴋᴇᴅ' });

    const receiver = await User.findOne({ mobile });
    if (!receiver) return res.status(404).json({ error: 'Rᴇᴄᴇɪᴠᴇʀ Nᴏᴛ Fᴏᴜɴᴅ' });

    if (sender.balance < amt)
      return res.status(400).json({ error: 'Iɴsᴜғғɪᴄɪᴇɴᴛ Bᴀʟᴀɴᴄᴇ' });

    // Update Balances
    sender.balance -= amt;
    receiver.balance += amt;
    await sender.save();
    await receiver.save();

    // Create Transaction
    const txn = await Transaction.create({
      sender: sender._id,
      receiver: receiver._id,
      amount: amt,
      type: 'payment',
      status: 'success',
      txnId: uuidv4().replace(/-/g,'').slice(0,12).toUpperCase(),
      note: 'Aᴘɪ Pᴀʏᴍᴇɴᴛ'
    });

    res.json({
      success: true,
      message: `₹${amt} Sᴜᴄᴄᴇssғᴜʟʟʏ Tʀᴀɴsғᴇʀʀᴇᴅ Tᴏ ${receiver.name}`,
      txnId: txn.txnId,
      sender: sender.name,
      receiver: receiver.name,
      newBalance: sender.balance
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST Version (JSON Body)
router.post('/', async (req, res) => {
  try {
    const { apikey, mobile, amount } = req.body;

    if (!apikey || !mobile || !amount)
      return res.status(400).json({ error: 'AᴘɪKᴇʏ Mᴏʙɪʟᴇ Aɴᴅ Aᴍᴏᴜɴᴛ RᴇQᴜɪʀᴇᴅ' });

    const amt = Number(amount);
    if (isNaN(amt) || amt < 1)
      return res.status(400).json({ error: 'Iɴᴠᴀʟɪᴅ Aᴍᴏᴜɴᴛ' });

    const sender = await User.findOne({ apiKey: apikey });
    if (!sender) return res.status(401).json({ error: 'Iɴᴠᴀʟɪᴅ AᴘɪKᴇʏ' });
    if (sender.isBlocked) return res.status(403).json({ error: 'Aᴄᴄᴏᴜɴᴛ Bʟᴏᴄᴋᴇᴅ' });

    const receiver = await User.findOne({ mobile });
    if (!receiver) return res.status(404).json({ error: 'Rᴇᴄᴇɪᴠᴇʀ Nᴏᴛ Fᴏᴜɴᴅ' });

    if (sender.balance < amt)
      return res.status(400).json({ error: 'Iɴsᴜғғɪᴄɪᴇɴᴛ Bᴀʟᴀɴᴄᴇ' });

    // Update Balances
    sender.balance -= amt;
    receiver.balance += amt;
    await sender.save();
    await receiver.save();

    // Create Transaction
    const txn = await Transaction.create({
      sender: sender._id,
      receiver: receiver._id,
      amount: amt,
      type: 'payment',
      status: 'success',
      txnId: uuidv4().replace(/-/g,'').slice(0,12).toUpperCase(),
      note: 'Aᴘɪ Pᴀʏᴍᴇɴᴛ'
    });

    res.json({
      success: true,
      message: `₹${amt} Sᴜᴄᴄᴇssғᴜʟʟʏ Tʀᴀɴsғᴇʀʀᴇᴅ Tᴏ ${receiver.name}`,
      txnId: txn.txnId,
      newBalance: sender.balance
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
