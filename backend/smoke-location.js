/* Smoke test location: token, opt-in, place, POST /posts con placeId */
const jwt = require('jsonwebtoken');
const prisma = require('./lib/prismaClient');
const secret = require('fs').readFileSync('.env', 'utf8').match(/JWT_SECRET=["']?([^"'\n]+)["']?/)[1];

(async () => {
  const user = await prisma.user.findFirst();
  const token = jwt.sign({ id: user.id, username: user.username }, secret, { expiresIn: '1h' });
  const H = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  // opt-in OFF -> 403 esperado
  await prisma.user.update({ where: { id: user.id }, data: { postLocationEnabled: false } });
  const search = await fetch('http://localhost:3000/places/search?q=Madrid&limit=1', { headers: H });
  const places = await search.json();
  console.log('search status:', search.status, '| primer lugar:', places[0]?.name, '|', places[0]?.locality);
  const placeId = places[0].id;

  const noOptIn = await fetch('http://localhost:3000/posts', { method: 'POST', headers: H, body: JSON.stringify({ content: 'Prueba location', placeId }) });
  console.log('POST sin opt-in ->', noOptIn.status, (await noOptIn.json()).error);

  // opt-in ON -> 201 esperado
  await prisma.user.update({ where: { id: user.id }, data: { postLocationEnabled: true } });
  const ok = await fetch('http://localhost:3000/posts', { method: 'POST', headers: H, body: JSON.stringify({ content: 'Prueba location', placeId }) });
  const post = await ok.json();
  console.log('POST con opt-in ->', ok.status, '| place en respuesta:', JSON.stringify(post.place));

  // place invalido -> 400 esperado
  const bad = await fetch('http://localhost:3000/posts', { method: 'POST', headers: H, body: JSON.stringify({ content: 'Prueba location 2', placeId: 'noexiste' }) });
  console.log('POST place invalido ->', bad.status, (await bad.json()).error);

  await prisma.post.delete({ where: { id: post.id } });
  await prisma.user.update({ where: { id: user.id }, data: { postLocationEnabled: false } });
  console.log('limpieza OK');
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
