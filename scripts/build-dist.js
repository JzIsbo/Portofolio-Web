import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const publicDir = path.join(rootDir, 'public');
const distDir = path.join(rootDir, 'dist');
const manifestPath = path.join(publicDir, 'build', 'manifest.json');

if (!fs.existsSync(manifestPath)) {
  console.error('Error: manifest.json not found at', manifestPath);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

const cssFile = manifest['resources/css/app.css']?.file;
const jsFile = manifest['resources/js/app.jsx']?.file;

if (!cssFile || !jsFile) {
  console.error('Error: CSS or JS entry not found in manifest');
  process.exit(1);
}

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy public/assets to dist/assets
const publicAssetsDir = path.join(publicDir, 'assets');
const distAssetsDir = path.join(distDir, 'assets');
if (fs.existsSync(publicAssetsDir)) {
  fs.cpSync(publicAssetsDir, distAssetsDir, { recursive: true });
}

// Copy public/build to dist/build
const publicBuildDir = path.join(publicDir, 'build');
const distBuildDir = path.join(distDir, 'build');
if (fs.existsSync(publicBuildDir)) {
  fs.cpSync(publicBuildDir, distBuildDir, { recursive: true });
}

// Copy favicon & robots if present
for (const f of ['favicon.svg', 'icons.svg', 'robots.txt']) {
  const src = path.join(publicDir, f);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(distDir, f));
  }
}

// Create api/contact mock response for static hosting
const distApiDir = path.join(distDir, 'api');
if (!fs.existsSync(distApiDir)) {
  fs.mkdirSync(distApiDir, { recursive: true });
}
fs.writeFileSync(
  path.join(distApiDir, 'contact'),
  JSON.stringify({ status: 'success', message: 'Pesan berhasil diterima!' }),
  'utf-8'
);

// Generate dist/index.html
const indexHtmlContent = `<!DOCTYPE html>
<html lang="id" class="dark scroll-smooth">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover" />
    <meta name="theme-color" content="#050510" />

    <title>Steve Marvin | Supervisor Brand Activation & Event Management</title>
    <meta
      name="description"
      content="Portofolio Steve Marvin — Supervisor Brand Activation di GOC (Purbasari, Amara, Onyx, CleanFace), Ex KANZLER (Cimory Group), spesialis Event Management & Brand Activation."
    />

    <!-- Google Fonts API -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@500;600;700;800&display=swap"
      rel="stylesheet"
    />

    <link rel="icon" type="image/png" href="/assets/frontCard.png" />

    <!-- Compiled Production Assets -->
    <link rel="stylesheet" crossorigin href="/build/${cssFile}">
    <script type="module" crossorigin src="/build/${jsFile}"></script>
  </head>
  <body class="bg-[#050510] text-[#e2e8f0] selection:bg-sky-500/30 selection:text-white font-sans antialiased overflow-x-hidden min-h-screen w-full max-w-full">
    <div id="root"></div>
  </body>
</html>
`;

fs.writeFileSync(path.join(distDir, 'index.html'), indexHtmlContent, 'utf-8');

// Also create public/index.html so either output directory works seamlessly
fs.writeFileSync(path.join(publicDir, 'index.html'), indexHtmlContent, 'utf-8');

console.log('✓ Successfully generated dist/index.html & synchronized assets for Vercel!');
