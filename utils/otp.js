const axios = require('axios');

// 🌟 Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000);
}

// 🌟 Send OTP via Fast2SMS
async function sendOTP(mobile, otp) {
  try {
    const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
      route: "v3",
      sender_id: "FSTSMS",
      message: `Your OTP Is ${otp}`,
      language: "english",
      numbers: mobile
    }, {
      headers: {
        'authorization': process.env.FAST2SMS_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error("❌ Fast2SMS Error:", error.response?.data || error.message);
    throw new Error("Failed To Send OTP");
  }
}

module.exports = { generateOTP, sendOTP };
