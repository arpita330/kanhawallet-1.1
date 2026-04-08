const router = require('express').Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { v4: uuidv4 } = require('uuid');

// Transfer Money To Another User
router.post('/', auth, async (req, res) => {
  try {
    const { username, amount, note } = req.body;
    if (!username || !amount) return res.status(400).json({ error: 'Uѕᴇʀɴᴀᴍᴇ ᴀɴᴅ Aᴍᴏᴜɴᴛ RᴇQᴜɪʀᴇᴅ' });
    if (amount < 1) return res.status(400).json({ error: 'Mɪɴɪᴍᴜᴍ Tʀᴀɴsғᴇʀ Iѕ ₹1' });

    const sender = await User.findById(req.user._id);
    const receiver = await User.findOne({ username });

    if (!receiver) return res.status(404).json({ error: 'Rᴇᴄᴇɪᴠᴇʀ Nᴏᴛ Fᴏᴜɴᴅ' });
    if (sender.username === username) return res.status(400).json({ error: 'Cᴀɴɴᴏᴛ Tʀᴀɴsғᴇʀ Tᴏ Yᴏᴜʀsᴇʟғ' });
    if (sender.balance < amount) return res.status(400).json({ error: 'Iɴsᴜғғɪᴄɪᴇɴᴛ Bᴀʟᴀɴᴄᴇ' });

    sender.balance -= amount;
    receiver.balance += amount;
    await sender.save();
    await receiver.save();

    const txn = await Transaction.create({
      sender: sender._id,
      receiver: receiver._id,
      amount,
      type: 'transfer',
      status: 'success',
      txnId: uuidv4().replace(/-/g,'').slice(0,12).toUpperCase(),
      note: note || 'Tʀᴀɴsғᴇʀ'
    });

    res.json({ 
      success: true, 
      message: `₹${amount} Sᴇɴᴛ Tᴏ ${receiver.fullName}`, 
      txnId: txn.txnId, 
      newBalance: sender.balance 
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
