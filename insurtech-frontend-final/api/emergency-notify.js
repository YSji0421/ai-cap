// Vercel Serverless Function — POST /api/emergency-notify
// Telegram + Resend 이메일을 통해 담당자에게 응급 알림을 보낸다.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    userName = '익명',
    userEmail = '',
    latitude = null,
    longitude = null,
    timestamp = new Date().toISOString(),
    message = '',
  } = req.body || {};

  const locationLine =
    latitude != null && longitude != null
      ? `위치: https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`
      : '위치: (권한 거부 또는 미사용)';

  const text =
    `🚨 응급 알림\n` +
    `사용자: ${userName}${userEmail ? ` (${userEmail})` : ''}\n` +
    `시각: ${timestamp}\n` +
    `${locationLine}\n` +
    (message ? `\n메모: ${message}` : '');

  const result = { telegram: 'skipped', email: 'skipped' };

  const tasks = [];

  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    tasks.push(
      fetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text,
            disable_web_page_preview: false,
          }),
        }
      )
        .then((r) => {
          result.telegram = r.ok ? 'ok' : `fail:${r.status}`;
        })
        .catch((e) => {
          result.telegram = `fail:${e.message}`;
        })
    );
  }

  if (process.env.RESEND_API_KEY && process.env.COUNSELOR_EMAIL) {
    tasks.push(
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'onboarding@resend.dev',
          to: process.env.COUNSELOR_EMAIL,
          subject: `🚨 [응급] ${userName} 님 알림`,
          text,
        }),
      })
        .then((r) => {
          result.email = r.ok ? 'ok' : `fail:${r.status}`;
        })
        .catch((e) => {
          result.email = `fail:${e.message}`;
        })
    );
  }

  await Promise.all(tasks);
  return res.status(200).json(result);
}
