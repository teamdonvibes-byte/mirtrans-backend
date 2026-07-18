export async function notifyAdmin(text) {
  const token = process.env.BOT_TOKEN;
  const chatId = process.env.ADMIN_TELEGRAM_ID;
  if (!token || !chatId) return;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
  } catch (err) {
    console.error('Failed to notify admin', err);
  }
}
