export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-access-code');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  // Validation du code d'accès client
  const accessCode = req.headers['x-access-code'];
  const validCodes = (process.env.ACCESS_CODES || '').split(',').map(c => c.trim()).filter(Boolean);

  if (!accessCode || !validCodes.includes(accessCode)) {
    return res.status(403).json({
      error: { type: 'access_denied', message: "Code d'accès invalide. Contactez Cognelia au contact@cognelia.fr" }
    });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({
      error: { type: 'server_error', message: 'Erreur serveur. Réessayez dans quelques instants.' }
    });
  }
}
