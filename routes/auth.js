const { generateOTP, sendOTP } = require('../utils/otp');
const otpStore = {}; // simple in-memory store, use Redis for production

router.post('/send-otp', async (req, res) => {
  const { mobile } = req.body;
  if (!mobile) return res.status(400).json({ error: 'Mobile required' });

  const otp = generateOTP();
  otpStore[mobile] = otp; // save OTP temporarily

  try {
    await sendOTP(mobile, otp);
    res.json({ success: true, message: `Oᴛᴘ Sᴇɴᴛ Tᴏ ${mobile}` });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/verify-otp', (req, res) => {
  const { mobile, otp } = req.body;
  if (!mobile || !otp) return res.status(400).json({ error: 'Mobile and OTP required' });

  if (otpStore[mobile] && otpStore[mobile] == otp) {
    delete otpStore[mobile]; // OTP verified
    return res.json({ success: true, message: 'Oᴛᴘ Vᴇʀɪꜰɪᴇᴅ' });
  } else {
    return res.status(400).json({ error: 'Invalid Oᴛᴘ' });
  }
});
