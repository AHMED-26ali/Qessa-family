import { readFile, writeFile } from 'node:fs/promises';
import { renderToString } from 'react-dom/server';
import App from '../src/App';

const indexPath = new URL('../dist/index.html', import.meta.url);
const indexHtml = await readFile(indexPath, 'utf8');
const root = '<div id="root"></div>';

if (!indexHtml.includes(root)) {
  throw new Error('Could not find the home page root in dist/index.html');
}

const markup = renderToString(<App />);
await writeFile(indexPath, indexHtml.replace(root, () => `<div id="root" data-prerendered="true">${markup}</div>`));
