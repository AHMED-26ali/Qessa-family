import { readFile, writeFile } from 'node:fs/promises';
import { renderToString } from 'react-dom/server';
import App from '../src/App';

const indexPath = new URL('../dist/index.html', import.meta.url);
const indexHtml = await readFile(indexPath, 'utf8');
const root = '<div id="root"></div>';
const styleSlot = '<!-- Homepage styles -->';
const stylesheet = indexHtml.match(/<link rel="stylesheet" crossorigin href="(\/assets\/[^"]+\.css)">/);

if (!indexHtml.includes(root)) {
  throw new Error('Could not find the home page root in dist/index.html');
}

if (!stylesheet || !indexHtml.includes(styleSlot)) {
  throw new Error('Could not find the home page stylesheet in dist/index.html');
}

const styles = await readFile(new URL('.' + stylesheet[1], indexPath), 'utf8');
const markup = renderToString(<App />);
const page = indexHtml
  .replace(stylesheet[0], '')
  .replace(styleSlot, () => `<style>${styles}</style>`)
  .replace(root, () => `<div id="root" data-prerendered="true">${markup}</div>`);
await writeFile(indexPath, page);
