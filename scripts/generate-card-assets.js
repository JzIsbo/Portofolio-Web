import { createCanvas, loadImage } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const assetsDir = path.join(rootDir, 'public', 'assets');
const distAssetsDir = path.join(rootDir, 'dist', 'assets');

async function generateAssets() {
  console.log('Generating authentic alfari.my.id-style editorial ID card for Steve Marvin...');

  // =========================================================================
  // 1. FRONT CARD (1024 x 1440) - EDITORIAL BRUTALIST VINTAGE CREAM PASS
  // =========================================================================
  const frontCvs = createCanvas(1024, 1440);
  const fCtx = frontCvs.getContext('2d');

  // Base vintage cream / off-white paper texture
  fCtx.fillStyle = '#ece7de';
  fCtx.fillRect(0, 0, 1024, 1440);

  // Subtle paper grain / micro-noise
  fCtx.fillStyle = 'rgba(0, 0, 0, 0.025)';
  for (let x = 0; x < 1024; x += 6) {
    for (let y = 0; y < 1440; y += 6) {
      if ((x * 7 + y * 13) % 17 === 0) {
        fCtx.fillRect(x, y, 2.5, 2.5);
      }
    }
  }

  // Outer border lines
  fCtx.strokeStyle = '#18181b';
  fCtx.lineWidth = 4;
  fCtx.strokeRect(36, 36, 952, 1368);

  fCtx.strokeStyle = '#27272a';
  fCtx.lineWidth = 1.5;
  fCtx.strokeRect(48, 48, 928, 1344);

  // --- Top Header Section ---
  // Left: Dark pill badge "SUPERVISOR"
  fCtx.fillStyle = '#18181b';
  fCtx.beginPath();
  if (fCtx.roundRect) fCtx.roundRect(64, 68, 220, 52, 10);
  else fCtx.rect(64, 68, 220, 52);
  fCtx.fill();

  fCtx.fillStyle = '#ffffff';
  fCtx.font = '900 24px sans-serif';
  fCtx.textAlign = 'center';
  fCtx.textBaseline = 'middle';
  fCtx.fillText('SUPERVISOR', 174, 94);

  // Right: Emblem & Company Name
  // GOC emblem (gold & blue shield)
  const embX = 740;
  const embY = 94;
  fCtx.fillStyle = '#0284c7';
  fCtx.beginPath();
  fCtx.arc(embX, embY, 24, 0, Math.PI * 2);
  fCtx.fill();
  fCtx.strokeStyle = '#f59e0b';
  fCtx.lineWidth = 3;
  fCtx.stroke();
  fCtx.fillStyle = '#ffffff';
  fCtx.font = '900 20px sans-serif';
  fCtx.fillText('GOC', embX, embY);

  fCtx.textAlign = 'left';
  fCtx.fillStyle = '#18181b';
  fCtx.font = '900 20px sans-serif';
  fCtx.fillText('PT GLORIA ORIGITA', 775, 84);
  fCtx.font = '700 16px sans-serif';
  fCtx.fillStyle = '#52525b';
  fCtx.fillText('COSMETICS • ID', 775, 106);

  // --- Giant Headline: BRAND ACTIVATION ---
  fCtx.textAlign = 'center';
  fCtx.fillStyle = '#18181b';
  fCtx.font = '900 102px "Impact", "Arial Black", sans-serif';
  fCtx.letterSpacing = '4px';
  fCtx.fillText('BRAND ACTIVATION', 512, 235);

  // Diagonal hatch texture across part of the text (industrial brutalist style)
  fCtx.strokeStyle = 'rgba(236, 231, 222, 0.7)';
  fCtx.lineWidth = 3;
  for (let d = 260; d < 460; d += 8) {
    fCtx.beginPath();
    fCtx.moveTo(d, 160);
    fCtx.lineTo(d + 40, 245);
    fCtx.stroke();
  }

  // --- Center Portrait Section ---
  const portX = 80;
  const portY = 270;
  const portW = 590;
  const portH = 750;

  // Navy deep blue background inside photo box
  const photoBgGrad = fCtx.createLinearGradient(portX, portY, portX, portY + portH);
  photoBgGrad.addColorStop(0, '#0f2744');
  photoBgGrad.addColorStop(0.5, '#1e3a5f');
  photoBgGrad.addColorStop(1, '#0a1626');
  fCtx.fillStyle = photoBgGrad;
  fCtx.fillRect(portX, portY, portW, portH);

  // Wavy sea/texture overlay
  fCtx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  fCtx.lineWidth = 3;
  for (let y = portY + 20; y < portY + portH; y += 32) {
    fCtx.beginPath();
    for (let x = portX; x < portX + portW; x += 15) {
      const cy = y + Math.sin((x - portX) * 0.04) * 8;
      if (x === portX) fCtx.moveTo(x, cy);
      else fCtx.lineTo(x, cy);
    }
    fCtx.stroke();
  }

  // Draw Steve Marvin's portrait
  let photoImg = null;
  for (const imgName of ['steve_hd.png', 'steve.png', 'me.png']) {
    const p = path.join(assetsDir, imgName);
    if (fs.existsSync(p)) {
      try {
        photoImg = await loadImage(p);
        break;
      } catch (e) {}
    }
  }

  if (photoImg) {
    fCtx.save();
    fCtx.beginPath();
    fCtx.rect(portX, portY, portW, portH);
    fCtx.clip();
    const sc = Math.max(portW / photoImg.width, portH / photoImg.height) * 1.05;
    const pw = photoImg.width * sc;
    const ph = photoImg.height * sc;
    fCtx.drawImage(photoImg, portX + (portW - pw) / 2, portY + portH - ph, pw, ph);
    fCtx.restore();
  }

  // Border around photo box
  fCtx.strokeStyle = '#18181b';
  fCtx.lineWidth = 4;
  fCtx.strokeRect(portX, portY, portW, portH);

  // White nameplate box directly under the photo
  fCtx.fillStyle = '#ffffff';
  fCtx.fillRect(portX + 20, portY + portH - 72, portW - 40, 56);
  fCtx.strokeStyle = '#18181b';
  fCtx.lineWidth = 3;
  fCtx.strokeRect(portX + 20, portY + portH - 72, portW - 40, 56);

  fCtx.fillStyle = '#18181b';
  fCtx.font = '900 34px sans-serif';
  fCtx.textAlign = 'center';
  fCtx.textBaseline = 'middle';
  fCtx.fillText('STEVE MARVIN', portX + portW / 2, portY + portH - 44);

  // --- Right Column: Vertical Box "EVENT MANAGEMENT" ---
  const colX = 705;
  const colY = 270;
  const colW = 245;
  const colH = 750;

  fCtx.fillStyle = '#f4efe6';
  fCtx.fillRect(colX, colY, colW, colH);
  fCtx.strokeStyle = '#18181b';
  fCtx.lineWidth = 4;
  fCtx.strokeRect(colX, colY, colW, colH);

  // Inner decorative rules
  fCtx.strokeStyle = 'rgba(24, 24, 27, 0.2)';
  fCtx.lineWidth = 1.5;
  fCtx.strokeRect(colX + 12, colY + 12, colW - 24, colH - 24);

  // Giant vertical text: EVENT MANAGEMENT
  fCtx.save();
  fCtx.translate(colX + colW / 2, colY + colH / 2);
  fCtx.rotate(Math.PI / 2);
  fCtx.fillStyle = '#18181b';
  fCtx.font = '900 62px "Impact", "Arial Black", sans-serif';
  fCtx.textAlign = 'center';
  fCtx.textBaseline = 'middle';
  fCtx.fillText('EVENT MANAGEMENT', 0, 0);
  fCtx.restore();

  // Corner grid marks in vertical column
  fCtx.fillStyle = '#18181b';
  fCtx.fillRect(colX + 18, colY + 20, 8, 8);
  fCtx.fillRect(colX + colW - 26, colY + 20, 8, 8);
  fCtx.fillRect(colX + 18, colY + colH - 28, 8, 8);
  fCtx.fillRect(colX + colW - 26, colY + colH - 28, 8, 8);

  // --- Bottom Section: PORTFOLIO & BRANDS ---
  const botY = 1055;

  // Dark bottom container
  fCtx.fillStyle = '#18181b';
  fCtx.fillRect(64, botY, 896, 290);
  fCtx.strokeStyle = '#27272a';
  fCtx.lineWidth = 3;
  fCtx.strokeRect(64, botY, 896, 290);

  // Title: PORTFOLIO
  fCtx.fillStyle = '#ffffff';
  fCtx.font = '900 64px "Impact", "Arial Black", sans-serif';
  fCtx.textAlign = 'left';
  fCtx.textBaseline = 'middle';
  fCtx.fillText('PORTFOLIO', 100, botY + 65);

  // Tagline
  fCtx.fillStyle = '#94a3b8';
  fCtx.font = 'italic 20px sans-serif';
  fCtx.fillText("Don't repeat yourself • Create Impact", 430, botY + 65);

  // Brand Pills
  fCtx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  fCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  fCtx.lineWidth = 2;
  fCtx.beginPath();
  if (fCtx.roundRect) fCtx.roundRect(95, botY + 115, 834, 68, 14);
  else fCtx.rect(95, botY + 115, 834, 68);
  fCtx.fill();
  fCtx.stroke();

  fCtx.fillStyle = '#ffffff';
  fCtx.font = 'bold 28px sans-serif';
  fCtx.textAlign = 'center';
  fCtx.fillText('Purbasari • CleanFace • Amara • Onyx', 512, botY + 150);

  // Ex Kanzler pill
  fCtx.fillStyle = '#38bdf8';
  fCtx.font = '900 24px monospace';
  fCtx.fillText('★ Ex KANZLER (Cimory Group) ★', 512, botY + 220);

  // Barcode / verification strip
  fCtx.fillStyle = '#64748b';
  fCtx.font = 'bold 16px monospace';
  fCtx.fillText('AUTHENTICATED PASS ID: SM-GOC-2026', 512, botY + 260);

  // Chrome 3D ribbon / chain accents (drawn with shiny silver gradients)
  const drawSilverRing = (ctx, cx, cy, r, thick) => {
    const sGrad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    sGrad.addColorStop(0, '#e2e8f0');
    sGrad.addColorStop(0.3, '#94a3b8');
    sGrad.addColorStop(0.5, '#ffffff');
    sGrad.addColorStop(0.7, '#64748b');
    sGrad.addColorStop(1, '#cbd5e1');
    ctx.strokeStyle = sGrad;
    ctx.lineWidth = thick;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  };

  drawSilverRing(fCtx, 75, 1260, 48, 14);
  drawSilverRing(fCtx, 945, 1260, 48, 14);

  const frontBuf = frontCvs.toBuffer('image/png');
  fs.writeFileSync(path.join(assetsDir, 'frontCard.png'), frontBuf);
  fs.writeFileSync(path.join(assetsDir, 'frontCard-B_vIkGBe.png'), frontBuf);
  if (fs.existsSync(distAssetsDir)) {
    fs.writeFileSync(path.join(distAssetsDir, 'frontCard.png'), frontBuf);
    fs.writeFileSync(path.join(distAssetsDir, 'frontCard-B_vIkGBe.png'), frontBuf);
  }
  console.log('✓ Successfully generated frontCard.png (' + frontBuf.length + ' bytes)');

  // =========================================================================
  // 2. BACK CARD (1024 x 1440) - EDITORIAL VINTAGE CREAM PASS WITH QR CODE
  // =========================================================================
  const backCvs = createCanvas(1024, 1440);
  const bCtx = backCvs.getContext('2d');

  // Base vintage cream paper
  bCtx.fillStyle = '#ece7de';
  bCtx.fillRect(0, 0, 1024, 1440);

  // Subtle grain
  bCtx.fillStyle = 'rgba(0, 0, 0, 0.025)';
  for (let x = 0; x < 1024; x += 6) {
    for (let y = 0; y < 1440; y += 6) {
      if ((x * 11 + y * 5) % 17 === 0) {
        bCtx.fillRect(x, y, 2.5, 2.5);
      }
    }
  }

  // Outer border lines
  bCtx.strokeStyle = '#18181b';
  bCtx.lineWidth = 4;
  bCtx.strokeRect(36, 36, 952, 1368);
  bCtx.strokeStyle = '#27272a';
  bCtx.lineWidth = 1.5;
  bCtx.strokeRect(48, 48, 928, 1344);

  // --- Top Header ---
  // Left: Hazard / Caution Tape box "SCAN HERE"
  const hazX = 64;
  const hazY = 68;
  const hazW = 280;
  const hazH = 68;

  bCtx.save();
  bCtx.fillStyle = '#facc15';
  bCtx.fillRect(hazX, hazY, hazW, hazH);
  bCtx.strokeStyle = '#18181b';
  bCtx.lineWidth = 4;
  bCtx.strokeRect(hazX, hazY, hazW, hazH);

  // Diagonal black caution stripes
  bCtx.fillStyle = '#18181b';
  for (let s = -40; s < hazW + 40; s += 28) {
    bCtx.beginPath();
    bCtx.moveTo(hazX + s, hazY + hazH);
    bCtx.lineTo(hazX + s + 18, hazY + hazH);
    bCtx.lineTo(hazX + s + 42, hazY);
    bCtx.lineTo(hazX + s + 24, hazY);
    bCtx.fill();
  }

  // "SCAN HERE" text pill
  bCtx.fillStyle = '#18181b';
  bCtx.fillRect(hazX + 24, hazY + 12, hazW - 48, hazH - 24);
  bCtx.fillStyle = '#ffffff';
  bCtx.font = '900 28px "Impact", sans-serif';
  bCtx.textAlign = 'center';
  bCtx.textBaseline = 'middle';
  bCtx.fillText('SCAN HERE', hazX + hazW / 2, hazY + hazH / 2);
  bCtx.restore();

  // Right: GOC Institution Logo & Text
  const bEmbX = 740;
  const bEmbY = 98;
  bCtx.fillStyle = '#0284c7';
  bCtx.beginPath();
  bCtx.arc(bEmbX, bEmbY, 24, 0, Math.PI * 2);
  bCtx.fill();
  bCtx.strokeStyle = '#f59e0b';
  bCtx.lineWidth = 3;
  bCtx.stroke();
  bCtx.fillStyle = '#ffffff';
  bCtx.font = '900 20px sans-serif';
  bCtx.textAlign = 'center';
  bCtx.fillText('GOC', bEmbX, bEmbY + 7);

  bCtx.textAlign = 'left';
  bCtx.fillStyle = '#18181b';
  bCtx.font = '900 20px sans-serif';
  bCtx.fillText('PT GLORIA ORIGITA', 775, 88);
  bCtx.font = '700 16px sans-serif';
  bCtx.fillStyle = '#52525b';
  bCtx.fillText('COSMETICS • ID', 775, 110);

  // --- Center Container: CONNECT OUR SOSMED + QR CODE ---
  const boxX = 64;
  const boxY = 175;
  const boxW = 600;
  const boxH = 820;

  bCtx.fillStyle = '#18181b';
  bCtx.fillRect(boxX, boxY, boxW, boxH);
  bCtx.strokeStyle = '#27272a';
  bCtx.lineWidth = 4;
  bCtx.strokeRect(boxX, boxY, boxW, boxH);

  // Header: CONNECT OUR SOSMED
  bCtx.fillStyle = '#ffffff';
  bCtx.font = '900 36px "Impact", sans-serif';
  bCtx.textAlign = 'center';
  bCtx.textBaseline = 'middle';
  bCtx.fillText('CONNECT OUR SOSMED', boxX + boxW / 2, boxY + 60);

  bCtx.strokeStyle = '#38bdf8';
  bCtx.lineWidth = 3;
  bCtx.beginPath();
  bCtx.moveTo(boxX + 60, boxY + 95);
  bCtx.lineTo(boxX + boxW - 60, boxY + 95);
  bCtx.stroke();

  // QR Code Frame
  const qrX = boxX + 65;
  const qrY = boxY + 130;
  const qrS = 470;

  bCtx.fillStyle = '#ffffff';
  bCtx.fillRect(qrX, qrY, qrS, qrS);
  bCtx.strokeStyle = '#e2e8f0';
  bCtx.lineWidth = 4;
  bCtx.strokeRect(qrX, qrY, qrS, qrS);

  // Large realistic QR code markers
  const drawQrCorner = (ctx, x, y, size) => {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + size * 0.18, y + size * 0.18, size * 0.64, size * 0.64);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x + size * 0.36, y + size * 0.36, size * 0.28, size * 0.28);
  };

  drawQrCorner(bCtx, qrX + 32, qrY + 32, 110);
  drawQrCorner(bCtx, qrX + qrS - 142, qrY + 32, 110);
  drawQrCorner(bCtx, qrX + 32, qrY + qrS - 142, 110);

  // QR pixel matrix
  bCtx.fillStyle = '#0f172a';
  const qrGrid = 22;
  const cell = (qrS - 64) / qrGrid;
  for (let r = 0; r < qrGrid; r++) {
    for (let c = 0; c < qrGrid; c++) {
      // Exclude corners
      const isCorner =
        (r < 7 && c < 7) ||
        (r < 7 && c >= qrGrid - 7) ||
        (r >= qrGrid - 7 && c < 7);
      if (!isCorner) {
        if ((r * 13 + c * 19 + (r * c) % 5) % 2 === 0) {
          bCtx.fillRect(qrX + 32 + c * cell, qrY + 32 + r * cell, cell - 1, cell - 1);
        }
      }
    }
  }

  // QR bottom text
  bCtx.fillStyle = '#94a3b8';
  bCtx.font = 'bold 20px monospace';
  bCtx.textAlign = 'center';
  bCtx.fillText('SCAN TO CONNECT ON LINKEDIN & INSTAGRAM', boxX + boxW / 2, boxY + boxH - 55);

  // --- Right Column: Vertical Box "SUPERVISOR BRAND ACTIVATION" ---
  const bColX = 705;
  const bColY = 175;
  const bColW = 245;
  const bColH = 820;

  bCtx.fillStyle = '#f4efe6';
  bCtx.fillRect(bColX, bColY, bColW, bColH);
  bCtx.strokeStyle = '#18181b';
  bCtx.lineWidth = 4;
  bCtx.strokeRect(bColX, bColY, bColW, bColH);

  bCtx.save();
  bCtx.translate(bColX + bColW / 2, bColY + bColH / 2);
  bCtx.rotate(Math.PI / 2);
  bCtx.fillStyle = '#18181b';
  bCtx.font = '900 58px "Impact", "Arial Black", sans-serif';
  bCtx.textAlign = 'center';
  bCtx.textBaseline = 'middle';
  bCtx.fillText('TEKNIK & STRATEGI BRAND', 0, 0);
  bCtx.restore();

  // --- Bottom Container Pill: STEVE MARVIN ---
  const bBotY = 1040;
  bCtx.fillStyle = '#18181b';
  bCtx.fillRect(64, bBotY, 896, 305);
  bCtx.strokeStyle = '#27272a';
  bCtx.lineWidth = 3;
  bCtx.strokeRect(64, bBotY, 896, 305);

  // Name
  bCtx.fillStyle = '#ffffff';
  bCtx.font = '900 52px sans-serif';
  bCtx.textAlign = 'center';
  bCtx.fillText('STEVE MARVIN', 512, bBotY + 70);

  // Subtitle
  bCtx.fillStyle = '#38bdf8';
  bCtx.font = 'bold 28px sans-serif';
  bCtx.fillText('Supervisor Brand Activation', 512, bBotY + 125);

  // Line
  bCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  bCtx.lineWidth = 2;
  bCtx.beginPath();
  bCtx.moveTo(140, bBotY + 155);
  bCtx.lineTo(884, bBotY + 155);
  bCtx.stroke();

  // Credentials
  bCtx.fillStyle = '#e2e8f0';
  bCtx.font = 'bold 24px sans-serif';
  bCtx.fillText('GOC (Purbasari • CleanFace • Amara • Onyx)', 512, bBotY + 195);

  bCtx.fillStyle = '#f59e0b';
  bCtx.font = '900 22px monospace';
  bCtx.fillText('Ex KANZLER (Cimory Group) • Event Management Specialist', 512, bBotY + 245);

  // Vintage decorative corner filigree
  const drawFiligree = (ctx, x, y, angle) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.strokeStyle = '#18181b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, Math.PI / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI / 2);
    ctx.stroke();
    ctx.restore();
  };

  drawFiligree(bCtx, 58, 58, 0);
  drawFiligree(bCtx, 966, 58, Math.PI / 2);
  drawFiligree(bCtx, 966, 1382, Math.PI);
  drawFiligree(bCtx, 58, 1382, -Math.PI / 2);

  const backBuf = backCvs.toBuffer('image/png');
  fs.writeFileSync(path.join(assetsDir, 'backCard.png'), backBuf);
  fs.writeFileSync(path.join(assetsDir, 'backCard-BGPpqBds.png'), backBuf);
  if (fs.existsSync(distAssetsDir)) {
    fs.writeFileSync(path.join(distAssetsDir, 'backCard.png'), backBuf);
    fs.writeFileSync(path.join(distAssetsDir, 'backCard-BGPpqBds.png'), backBuf);
  }
  console.log('✓ Successfully generated backCard.png (' + backBuf.length + ' bytes)');

  // =========================================================================
  // 3. STRAP BAND (512 x 2048) - EXACT alfari.my.id MATTE BLACK STRAP
  // =========================================================================
  const bandCvs = createCanvas(512, 2048);
  const bandCtx = bandCvs.getContext('2d');

  // Matte black webbing strap base
  bandCtx.fillStyle = '#0f1118';
  bandCtx.fillRect(0, 0, 512, 2048);

  // Micro fabric edge stitch
  bandCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  bandCtx.lineWidth = 4;
  bandCtx.strokeRect(18, 0, 476, 2048);

  // 2 Repeating Modules
  for (let m = 0; m < 2; m++) {
    const yOffset = m * 1024;

    // Circular white outline monogram Ⓢ (circle with S)
    const monoX = 256;
    const monoY = yOffset + 160;
    const monoR = 64;

    bandCtx.strokeStyle = '#ffffff';
    bandCtx.lineWidth = 6;
    bandCtx.beginPath();
    bandCtx.arc(monoX, monoY, monoR, 0, Math.PI * 2);
    bandCtx.stroke();

    bandCtx.fillStyle = '#ffffff';
    bandCtx.font = '900 68px sans-serif';
    bandCtx.textAlign = 'center';
    bandCtx.textBaseline = 'middle';
    bandCtx.fillText('S', monoX, monoY + 2);

    // Text running vertically downwards along the strap: "Steve Marvin"
    bandCtx.save();
    bandCtx.translate(monoX, yOffset + 320);
    bandCtx.rotate(Math.PI / 2);

    // Clean, elegant white typography
    bandCtx.fillStyle = '#ffffff';
    bandCtx.font = 'bold 64px sans-serif';
    bandCtx.textAlign = 'left';
    bandCtx.textBaseline = 'middle';
    bandCtx.fillText('Steve Marvin', 0, 0);

    // Subtitle
    bandCtx.fillStyle = '#94a3b8';
    bandCtx.font = 'bold 42px sans-serif';
    bandCtx.fillText('• Brand Activation', 420, 0);

    bandCtx.restore();
  }

  const bandBuf = bandCvs.toBuffer('image/png');
  fs.writeFileSync(path.join(assetsDir, 'band.png'), bandBuf);
  fs.writeFileSync(path.join(assetsDir, 'bandd-aEExZUcs.png'), bandBuf);
  if (fs.existsSync(distAssetsDir)) {
    fs.writeFileSync(path.join(distAssetsDir, 'band.png'), bandBuf);
    fs.writeFileSync(path.join(distAssetsDir, 'bandd-aEExZUcs.png'), bandBuf);
  }
  console.log('✓ Successfully generated band.png (' + bandBuf.length + ' bytes)');
}

generateAssets().catch((err) => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
