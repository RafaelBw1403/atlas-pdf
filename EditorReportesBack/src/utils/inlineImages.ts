import { get as httpsGet, Agent as HttpsAgent } from 'node:https';
import { get as httpGet } from 'node:http';

export async function inlineImages(html: string): Promise<string> {
  const imgRegex = /<img[^>]+src\s*=\s*["']([^"']+)["'][^>]*>/gi;
  const matches = Array.from(html.matchAll(imgRegex));

  if (matches.length === 0) {
    console.log('[inlineImages] No se encontraron imágenes externas');
    return html;
  }

  console.log(`[inlineImages] Encontradas ${matches.length} imágenes para procesar`);
  const replacements: Promise<{ original: string; replacement: string }>[] = [];

  for (const match of matches) {
    const src = match[1];
    if (!src || src.startsWith('data:')) continue;

    console.log(`[inlineImages] Descargando: ${src.substring(0, 80)}...`);

    replacements.push(
      downloadAndInline(src)
        .then(dataUri => ({
          original: match[0],
          replacement: match[0].replace(src, dataUri),
        }))
        .catch(err => {
          console.error(`[inlineImages] Error descargando ${src}:`, err.message);
          return { original: match[0], replacement: match[0] };
        })
    );
  }

  const results = await Promise.all(replacements);
  let result = html;
  for (const { original, replacement } of results) {
    result = result.replace(original, replacement);
  }
  console.log(`[inlineImages] Procesadas ${results.length} imágenes`);
  return result;
}



function downloadAndInline(url: string, maxRedirects = 5): Promise<string> {
  return new Promise((resolve, reject) => {
    const doRequest = (reqUrl: string, redirectsLeft: number) => {
      const urlObj = new URL(reqUrl);
      const protocol = urlObj.protocol;
      const options: any = {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PDFGenerator/1.0)' },
        timeout: 15000,
      };

      // Para HTTPS, ignorar certificados autofirmados solo si la variable lo permite
      if (protocol === 'https:' && process.env.INLINE_IMAGES_IGNORE_SSL === 'true') {
        options.agent = new HttpsAgent({ rejectUnauthorized: false });
        console.log('[inlineImages] SSL verification disabled (INLINE_IMAGES_IGNORE_SSL=true)');
      }

      const mod = protocol === 'https:' ? httpsGet : httpGet;

      const req = mod(reqUrl, options, (res) => {
        // manejo de redirects...
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400
            && res.headers.location && redirectsLeft > 0) {
          console.log(`[inlineImages] Redirect ${res.statusCode} -> ${res.headers.location}`);
          res.resume();
          const nextUrl = new URL(res.headers.location, new URL(reqUrl)).href;
          doRequest(nextUrl, redirectsLeft - 1);
          return;
        }

        if (!res.statusCode || res.statusCode >= 300) {
          reject(new Error(`HTTP ${res.statusCode}`));
          res.resume();
          return;
        }

        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => {
          const contentType = res.headers['content-type'] || 'image/png';
          const buffer = Buffer.concat(chunks);
          console.log(`[inlineImages] Descargado ${(buffer.length / 1024).toFixed(1)}KB -> data URI`);
          resolve(`data:${contentType};base64,${buffer.toString('base64')}`);
        });
      });
      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Timeout'));
      });
    };

    doRequest(url, maxRedirects);
  });
}
