// api/index.js

const CLIENT_ID = '1393535934175121438';
const CLIENT_SECRET = '_FOswHv-dY_l_fdrQgvAhO4uUpLtT0iI'; // Discord Developer Portal’dan alın
const REDIRECT_URI = 'https://nineborn.vercel.app/api/callback'; // Vercel URL ve path

const htmlPage = `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>NineBorn Roleplay V1.5</title>
  <!-- (Buraya önceki verdiğin stil ve HTML kodlarını ekle) -->
</head>
<body>
  <!-- Örnek basit Discord OAuth linki -->
  <a href="https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=identify">
    Discord ile Giriş Yap
  </a>
  <!-- Diğer HTML içeriğin -->
</body>
</html>
`;

async function getAccessToken(code) {
  const params = new URLSearchParams();
  params.append('client_id', CLIENT_ID);
  params.append('client_secret', CLIENT_SECRET);
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('redirect_uri', REDIRECT_URI);
  params.append('scope', 'identify');

  const res = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    body: params,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  if (!res.ok) throw new Error('Token isteği başarısız');

  return res.json();
}

async function getUserData(token) {
  const res = await fetch('https://discord.com/api/users/@me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Kullanıcı bilgisi alınamadı');

  return res.json();
}

module.exports = async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  
  if (url.pathname === '/') {
    // Ana sayfa, HTML gönder
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(htmlPage);
    return;
  }

  if (url.pathname === '/api/callback') {
    const code = url.searchParams.get('code');
    if (!code) {
      res.statusCode = 400;
      res.end('Code parametresi eksik');
      return;
    }

    try {
      // Token al
      const tokenResponse = await getAccessToken(code);
      // Kullanıcı bilgilerini çek
      const user = await getUserData(tokenResponse.access_token);

      // Basit kullanıcı bilgisi göster
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(`
        <h1>Hoşgeldin, ${user.username}#${user.discriminator}!</h1>
        <p>ID: ${user.id}</p>
        <img src="https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png" alt="Avatar" />
      `);
    } catch (e) {
      res.statusCode = 500;
      res.end('OAuth hatası: ' + e.message);
    }
    return;
  }

  // Diğer istekler için 404
  res.statusCode = 404;
  res.end('Sayfa bulunamadı');
};
