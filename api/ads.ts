import type { Request, Response } from 'express';

export default function handler(req: Request, res: Response) {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (!['GET', 'HEAD'].includes(req.method)) {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).send('Method not allowed\n');
  }

  const publisherId = process.env.ADSENSE_PUBLISHER_ID?.trim().replace(/^ca-/, '');
  if (!publisherId || !/^pub-\d{16}$/.test(publisherId)) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(404).send('No ads.txt entries have been configured.\n');
  }

  res.setHeader('Cache-Control', 'public, s-maxage=300');
  return res.send(`google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`);
}
