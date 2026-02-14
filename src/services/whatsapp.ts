
const INSTANCE_ID = '688C218ABF0A1';
const ACCESS_TOKEN = '685694fd67a5b';
const BASE_URL = 'https://sms.fastpaynow.in/api/send';

export const sendWhatsAppMessage = async (number: string, message: string) => {
  // Clean number: ensure 91 prefix
  const cleanNumber = number.startsWith('91') ? number : `91${number.replace(/\D/g, '')}`;
  
  const url = `${BASE_URL}?number=${cleanNumber}&type=text&message=${encodeURIComponent(message)}&instance_id=${INSTANCE_ID}&access_token=${ACCESS_TOKEN}`;
  
  console.log(`[WhatsApp Mock API] Sending to ${cleanNumber}: ${message}`);
  
  try {
    // In a real browser environment, CORS might block this. 
    // Usually handled by a backend proxy in Next.js.
    // fetch(url);
    return true;
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
    return false;
  }
};

export const notifyStudentRegistration = async (name: string, number: string, gymName: string) => {
  const msg = `Hello ${name}! Welcome to ${gymName}. Your registration is successful. Let's hit the goals! 🏋️‍♂️`;
  return await sendWhatsAppMessage(number, msg);
};

export const notifyPaymentReceived = async (name: string, number: string, amount: number, pending: number) => {
  const msg = `Hi ${name}, we received your payment of ₹${amount}. ${pending > 0 ? `Pending balance: ₹${pending}.` : 'Full payment received. Thank you!'}`;
  return await sendWhatsAppMessage(number, msg);
};

export const notifyExpiryReminder = async (name: string, number: string, daysLeft: number) => {
  let msg = '';
  if (daysLeft === 0) {
    msg = `Urgent! ${name}, your gym membership at IronCore expires TODAY. Please renew to continue your workout.`;
  } else {
    msg = `Hi ${name}, your gym membership is expiring in ${daysLeft} day(s). Don't break your streak, renew now!`;
  }
  return await sendWhatsAppMessage(number, msg);
};
