// Bundles the site into one self-contained HTML fragment for a quick shareable preview.
// Usage: node tools/build-preview.mjs <output.html>
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = p => readFileSync(join(root, p), 'utf8');
const html = read('index.html');

const title = html.match(/<title>[^]*?<\/title>/)[0];
const fonts = html.match(/<link rel="stylesheet" href="https:\/\/fonts[^>]+>/)[0];
let body = html.match(/<body>([^]*)<\/body>/)[1];
body = body.replace(/<script src="([^"]+)"><\/script>/g, (_, src) => `<script>\n${read(src)}\n</script>`);

const out = `${title}
<meta name="claude:viewport-fit-sides" content="cover">
${fonts}
<style>
${read('assets/css/style.css')}
</style>
${body}`;
writeFileSync(process.argv[2], out);
console.log(`wrote ${process.argv[2]} (${(out.length / 1024).toFixed(1)} KB)`);
