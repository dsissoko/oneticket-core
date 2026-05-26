import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import rehypeMermaid from 'rehype-mermaid';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// DOC_SOURCE is set by CI workflow from current_project
// Default: ../.oneticket/docs for local development
const docSource = process.env.DOC_SOURCE
  ? path.resolve(__dirname, '..', process.env.DOC_SOURCE)
  : path.resolve(__dirname, '../.oneticket/docs');

// Build sidebar with fixed order: what, how, ship, run — collapsed by default
const ORDER = ['what', 'how', 'ship', 'run'];

function buildSidebar(docsDir) {
  if (!fs.existsSync(docsDir)) return [];
  const dirs = fs.readdirSync(docsDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);

  // Sort by ORDER, then alphabetically for any extra directories
  const sorted = [
    ...ORDER.filter(name => dirs.includes(name)),
    ...dirs.filter(name => !ORDER.includes(name)).sort(),
  ];

  return sorted.map(name => ({
    label: name.charAt(0).toUpperCase() + name.slice(1),
    collapsed: true,
    autogenerate: { directory: name, collapsed: true },
  }));
}

const sidebar = buildSidebar(docSource);

export default defineConfig({
  integrations: [
    starlight({
      title: 'OneTicket',
      description: 'GitHub-native autonomous multi-agent orchestration framework',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/dsissoko/oneticket-core' },
      ],
      sidebar,
      components: {
        Footer: './src/components/DocFooter.astro',
      },
    }),
  ],
  markdown: {
    rehypePlugins: [rehypeMermaid],
  },
});
