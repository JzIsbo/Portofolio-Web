import { createCanvas, loadImage } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const assetsDir = path.join(rootDir, 'public', 'assets');
const distAssetsDir = path.join(rootDir, 'dist', 'assets');

// Helper to draw rounded rectangle with cross-platform fallback
function drawRoundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, width, height, radius);
  } else {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}

async function generateAssets() {
  console.log('Generating official VIP PASS card model & exact alfari-style Steve Marvin lanyard strap...');

  // =========================================================================
  // 1. FRONT CARD (1600 x 2400) - OFFICIAL VIP PASS (SPACIOUS, NO BARCODE)
  // =========================================================================
  const W = 1600;
  const H = 2400;
  const frontCvs = createCanvas(W, H);
  const fCtx = frontCvs.getContext('2d');

  // Deep dark cyber-cosmic gradient background
  const bgGrad = fCtx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, '#0a0d18');
  bgGrad.addColorStop(0.3, '#170f2b');
  bgGrad.addColorStop(0.65, '#120b22');
  bgGrad.addColorStop(1, '#070811');
  fCtx.fillStyle = bgGrad;
  fCtx.fillRect(0, 0, W, H);

  // Background tech grid
  fCtx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  fCtx.lineWidth = 2;
  for (let x = 60; x < W; x += 64) {
    fCtx.beginPath();
    fCtx.moveTo(x, 60);
    fCtx.lineTo(x, H - 60);
    fCtx.stroke();
  }
  for (let y = 60; y < H; y += 64) {
    fCtx.beginPath();
    fCtx.moveTo(60, y);
    fCtx.lineTo(W - 60, y);
    fCtx.stroke();
  }

  // Iridescent holographic security strip on left margin
  const holoGrad = fCtx.createLinearGradient(48, 0, 116, H);
  holoGrad.addColorStop(0, '#f43f5e');
  holoGrad.addColorStop(0.2, '#c084fc');
  holoGrad.addColorStop(0.4, '#38bdf8');
  holoGrad.addColorStop(0.6, '#34d399');
  holoGrad.addColorStop(0.8, '#fbbf24');
  holoGrad.addColorStop(1, '#f43f5e');
  fCtx.fillStyle = holoGrad;
  fCtx.fillRect(48, 48, 68, H - 96);

  fCtx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
  fCtx.lineWidth = 3;
  for (let i = 0; i < H; i += 32) {
    fCtx.beginPath();
    fCtx.moveTo(48, i);
    fCtx.lineTo(116, i + 48);
    fCtx.stroke();
  }

  // Outer Neon Rose Border
  fCtx.strokeStyle = '#f43f5e';
  fCtx.lineWidth = 22;
  drawRoundRect(fCtx, 36, 36, W - 72, H - 72, 48);
  fCtx.stroke();

  // Inner bright bevel accent stroke
  fCtx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  fCtx.lineWidth = 4;
  drawRoundRect(fCtx, 60, 60, W - 120, H - 120, 36);
  fCtx.stroke();

  // Top VIP Header Pill
  fCtx.fillStyle = 'rgba(244, 63, 94, 0.35)';
  fCtx.strokeStyle = '#f43f5e';
  fCtx.lineWidth = 5;
  drawRoundRect(fCtx, 160, 95, W - 320, 110, 55);
  fCtx.fill();
  fCtx.stroke();

  fCtx.fillStyle = '#ffffff';
  fCtx.font = '900 46px sans-serif';
  fCtx.textAlign = 'center';
  fCtx.fillText('★ OFFICIAL VIP PASS | BRAND ACTIVATION ★', W / 2, 168);

  // Steve Marvin Portrait Photo Section
  const photoY = 640;
  const photoRadius = 300;

  // Outer pulsing glow rings
  fCtx.strokeStyle = 'rgba(244, 63, 94, 0.35)';
  fCtx.lineWidth = 22;
  fCtx.beginPath();
  fCtx.arc(W / 2, photoY, photoRadius + 22, 0, Math.PI * 2);
  fCtx.stroke();

  fCtx.strokeStyle = '#f43f5e';
  fCtx.lineWidth = 12;
  fCtx.beginPath();
  fCtx.arc(W / 2, photoY, photoRadius + 6, 0, Math.PI * 2);
  fCtx.stroke();

  // Load Steve's actual portrait photo
  let photoImg = null;
  for (const imgName of ['steve_hd.png', 'steve.png', 'me.png']) {
    const p = path.join(assetsDir, imgName);
    if (fs.existsSync(p)) {
      try {
        photoImg = await loadImage(p);
        console.log('Loading Steve photo from:', p);
        break;
      } catch (e) {}
    }
  }

  if (photoImg) {
    fCtx.save();
    fCtx.beginPath();
    fCtx.arc(W / 2, photoY, photoRadius, 0, Math.PI * 2);
    fCtx.clip();
    const sc = Math.max((photoRadius * 2) / photoImg.width, (photoRadius * 2) / photoImg.height);
    const pw = photoImg.width * sc;
    const ph = photoImg.height * sc;
    fCtx.drawImage(photoImg, W / 2 - pw / 2, photoY - ph / 2, pw, ph);
    fCtx.restore();
  }

  // Name: STEVE MARVIN (Ultra-Crisp, High Contrast, 900 Weight)
  fCtx.textAlign = 'center';
  fCtx.fillStyle = '#ffffff';
  fCtx.font = '900 128px sans-serif';
  fCtx.shadowColor = 'rgba(0, 0, 0, 0.85)';
  fCtx.shadowBlur = 18;
  fCtx.shadowOffsetY = 6;
  fCtx.fillText('STEVE MARVIN', W / 2, 1100);
  fCtx.shadowBlur = 0;
  fCtx.shadowOffsetY = 0;

  // Subtitle: SUPERVISOR BRAND ACTIVATION
  fCtx.fillStyle = '#fb7185';
  fCtx.font = '900 58px sans-serif';
  fCtx.fillText('SUPERVISOR BRAND ACTIVATION', W / 2, 1195);

  // Brand Badge 1: GOC (Purbasari • Amara • Onyx • CleanFace)
  fCtx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  fCtx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  fCtx.lineWidth = 4;
  drawRoundRect(fCtx, 140, 1280, W - 280, 125, 62);
  fCtx.fill();
  fCtx.stroke();

  fCtx.fillStyle = '#ffffff';
  fCtx.font = '900 50px sans-serif';
  fCtx.fillText('GOC (Purbasari • Amara • Onyx • CleanFace)', W / 2, 1360);

  // Brand Badge 2: Ex KANZLER (Cimory Group)
  fCtx.fillStyle = 'rgba(56, 189, 248, 0.22)';
  fCtx.strokeStyle = '#38bdf8';
  fCtx.lineWidth = 4;
  drawRoundRect(fCtx, 240, 1445, W - 480, 115, 57);
  fCtx.fill();
  fCtx.stroke();

  fCtx.fillStyle = '#bae6fd';
  fCtx.font = '900 48px monospace';
  fCtx.fillText('Ex KANZLER (Cimory Group)', W / 2, 1520);

  // Track Record Tagline Pill
  fCtx.fillStyle = 'rgba(244, 63, 94, 0.18)';
  fCtx.strokeStyle = 'rgba(244, 63, 94, 0.6)';
  fCtx.lineWidth = 3.5;
  drawRoundRect(fCtx, 160, 1600, W - 320, 105, 52);
  fCtx.fill();
  fCtx.stroke();

  fCtx.fillStyle = '#fce7f3';
  fCtx.font = '900 40px monospace';
  fCtx.fillText('EVENT MANAGEMENT • BRAND EXPERIENTIAL', W / 2, 1668);

  // Official Pass ID Badge
  fCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  fCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  fCtx.lineWidth = 3.5;
  drawRoundRect(fCtx, 180, 1750, W - 360, 160, 32);
  fCtx.fill();
  fCtx.stroke();

  fCtx.fillStyle = '#22c55e';
  fCtx.font = '900 44px monospace';
  fCtx.fillText('✔ VERIFIED ID: SM-GOC-2026-VIP', W / 2, 1818);

  fCtx.fillStyle = '#cbd5e1';
  fCtx.font = '900 34px monospace';
  fCtx.fillText('ACTIVATION SUPERVISOR • SPECIALIST LEAD', W / 2, 1874);

  // Security Microtext - Clear and sharp at bottom
  fCtx.fillStyle = '#94a3b8';
  fCtx.font = '900 28px monospace';
  fCtx.fillText('SECURITY LEVEL: MAXIMUM 2026 • AUTHORIZED PERSONNEL ONLY', W / 2, 2220);
  fCtx.fillStyle = '#64748b';
  fCtx.font = 'bold 24px monospace';
  fCtx.fillText('PT GLORIA ORIGITA COSMETICS • OFFICIAL PASS', W / 2, 2275);

  const frontBuf = frontCvs.toBuffer('image/png');
  fs.writeFileSync(path.join(assetsDir, 'frontCard.png'), frontBuf);
  fs.writeFileSync(path.join(assetsDir, 'frontCard-B_vIkGBe.png'), frontBuf);
  if (fs.existsSync(distAssetsDir)) {
    fs.writeFileSync(path.join(distAssetsDir, 'frontCard.png'), frontBuf);
    fs.writeFileSync(path.join(distAssetsDir, 'frontCard-B_vIkGBe.png'), frontBuf);
  }
  console.log('✓ Successfully wrote frontCard.png (' + frontBuf.length + ' bytes)');

  // =========================================================================
  // 2. BACK CARD (1600 x 2400) - OFFICIAL VIP PASS BACK (PORTOFOLIO SPELLING)
  // =========================================================================
  const backCvs = createCanvas(W, H);
  const bCtx = backCvs.getContext('2d');

  const bGrad = bCtx.createLinearGradient(0, 0, W, H);
  bGrad.addColorStop(0, '#0a0d18');
  bGrad.addColorStop(0.35, '#190e2b');
  bGrad.addColorStop(0.7, '#120b22');
  bGrad.addColorStop(1, '#070811');
  bCtx.fillStyle = bGrad;
  bCtx.fillRect(0, 0, W, H);

  // Background grid
  bCtx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  bCtx.lineWidth = 2;
  for (let x = 60; x < W; x += 64) {
    bCtx.beginPath();
    bCtx.moveTo(x, 60);
    bCtx.lineTo(x, H - 60);
    bCtx.stroke();
  }
  for (let y = 60; y < H; y += 64) {
    bCtx.beginPath();
    bCtx.moveTo(60, y);
    bCtx.lineTo(W - 60, y);
    bCtx.stroke();
  }

  // Outer Border
  bCtx.strokeStyle = '#f43f5e';
  bCtx.lineWidth = 22;
  drawRoundRect(bCtx, 36, 36, W - 72, H - 72, 48);
  bCtx.stroke();

  // Inner bevel stroke
  bCtx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  bCtx.lineWidth = 4;
  drawRoundRect(bCtx, 60, 60, W - 120, H - 120, 36);
  bCtx.stroke();

  // Title: STEVE MARVIN
  bCtx.fillStyle = '#ffffff';
  bCtx.font = '900 110px sans-serif';
  bCtx.textAlign = 'center';
  bCtx.fillText('STEVE MARVIN', W / 2, 175);

  bCtx.fillStyle = '#fb7185';
  bCtx.font = '900 52px sans-serif';
  bCtx.fillText('SUPERVISOR BRAND ACTIVATION', W / 2, 252);

  // Header Pill
  bCtx.fillStyle = 'rgba(244, 63, 94, 0.30)';
  bCtx.strokeStyle = 'rgba(244, 63, 94, 0.9)';
  bCtx.lineWidth = 4;
  drawRoundRect(bCtx, 160, 305, W - 320, 96, 48);
  bCtx.fill();
  bCtx.stroke();

  bCtx.fillStyle = '#ffffff';
  bCtx.font = '900 38px monospace';
  bCtx.fillText('CORE COMPETENCIES & TRACK RECORD', W / 2, 368);

  const skills = [
    '✦ Stage Production & Event Planning',
    '✦ Multi-Brand Experiential Marketing',
    '✦ Nationwide Roadshow Orchestration',
    '✦ FMCG & Beauty Market Strategy',
    '✦ KOL, Community & Media Outreach',
    '✦ Vendor & Logistics Negotiation',
    '✦ Budget Allocation & ROI Optimization',
  ];

  bCtx.textAlign = 'left';
  skills.forEach((skill, idx) => {
    const itemY = 515 + idx * 115;

    bCtx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    bCtx.strokeStyle = 'rgba(255, 255, 255, 0.30)';
    bCtx.lineWidth = 3;
    drawRoundRect(bCtx, 100, itemY - 65, W - 200, 95, 24);
    bCtx.fill();
    bCtx.stroke();

    bCtx.fillStyle = '#ffffff';
    bCtx.font = '900 46px sans-serif';
    bCtx.fillText(skill, 150, itemY);
  });

  // Portofolio Brands Box (PORTOFOLIO spelling per request!)
  const boxY = 1350;
  bCtx.fillStyle = 'rgba(244, 63, 94, 0.25)';
  bCtx.strokeStyle = '#f43f5e';
  bCtx.lineWidth = 5;
  drawRoundRect(bCtx, 100, boxY, W - 200, 340, 36);
  bCtx.fill();
  bCtx.stroke();

  bCtx.fillStyle = '#fda4af';
  bCtx.font = '900 44px monospace';
  bCtx.textAlign = 'center';
  bCtx.fillText('PORTOFOLIO BRANDS', W / 2, boxY + 75);

  bCtx.fillStyle = '#ffffff';
  bCtx.font = '900 62px sans-serif';
  bCtx.fillText('Purbasari • CleanFace • Amara • Onyx', W / 2, boxY + 175);

  bCtx.fillStyle = '#7dd3fc';
  bCtx.font = '900 48px monospace';
  bCtx.fillText('Ex KANZLER (Cimory Group)', W / 2, boxY + 265);

  // Authenticated Pass Seal with simulated QR
  const authY = 1735;
  bCtx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  bCtx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  bCtx.lineWidth = 4;
  drawRoundRect(bCtx, 100, authY, W - 200, 360, 36);
  bCtx.fill();
  bCtx.stroke();

  // QR Code Frame
  const qrX = 180;
  const qrY = authY + 45;
  const qrS = 270;
  bCtx.fillStyle = '#ffffff';
  drawRoundRect(bCtx, qrX, qrY, qrS, qrS, 16);
  bCtx.fill();

  bCtx.fillStyle = '#0f172a';
  bCtx.fillRect(qrX + 25, qrY + 25, 65, 65);
  bCtx.fillRect(qrX + qrS - 90, qrY + 25, 65, 65);
  bCtx.fillRect(qrX + 25, qrY + qrS - 90, 65, 65);

  bCtx.fillStyle = '#ffffff';
  bCtx.fillRect(qrX + 40, qrY + 40, 35, 35);
  bCtx.fillRect(qrX + qrS - 75, qrY + 40, 35, 35);
  bCtx.fillRect(qrX + 40, qrY + qrS - 75, 35, 35);

  bCtx.fillStyle = '#0f172a';
  bCtx.fillRect(qrX + 50, qrY + 50, 15, 15);
  bCtx.fillRect(qrX + qrS - 65, qrY + 50, 15, 15);
  bCtx.fillRect(qrX + 50, qrY + qrS - 65, 15, 15);

  // QR inner data patterns
  bCtx.fillRect(qrX + 115, qrY + 35, 25, 25);
  bCtx.fillRect(qrX + 120, qrY + 80, 22, 35);
  bCtx.fillRect(qrX + 110, qrY + 130, 38, 20);
  bCtx.fillRect(qrX + 115, qrY + 175, 30, 30);
  bCtx.fillRect(qrX + 160, qrY + 105, 32, 32);
  bCtx.fillRect(qrX + 195, qrY + 155, 38, 25);
  bCtx.fillRect(qrX + 80, qrY + 42, 20, 20);
  bCtx.fillRect(qrX + 45, qrY + 86, 20, 20);
  bCtx.fillRect(qrX + 92, qrY + 92, 32, 32);

  bCtx.textAlign = 'left';
  bCtx.fillStyle = '#22c55e';
  bCtx.font = '900 52px monospace';
  bCtx.fillText('✔ AUTHENTICATED PASS', 510, authY + 115);

  bCtx.fillStyle = '#f8fafc';
  bCtx.font = '900 42px monospace';
  bCtx.fillText('GOC BRAND ACTIVATION TEAM', 510, authY + 185);

  bCtx.fillStyle = '#cbd5e1';
  bCtx.font = '900 34px monospace';
  bCtx.fillText('SCAN TO CONNECT & VERIFY', 510, authY + 250);

  // Bottom microtext (PORTOFOLIO spelling!)
  bCtx.textAlign = 'center';
  bCtx.fillStyle = '#94a3b8';
  bCtx.font = '900 24px monospace';
  bCtx.fillText('STEVE MARVIN • GOC PORTOFOLIO 2026 • ALL RIGHTS RESERVED', W / 2, 2310);

  const backBuf = backCvs.toBuffer('image/png');
  fs.writeFileSync(path.join(assetsDir, 'backCard.png'), backBuf);
  fs.writeFileSync(path.join(assetsDir, 'backCard-BGPpqBds.png'), backBuf);
  if (fs.existsSync(distAssetsDir)) {
    fs.writeFileSync(path.join(distAssetsDir, 'backCard.png'), backBuf);
    fs.writeFileSync(path.join(distAssetsDir, 'backCard-BGPpqBds.png'), backBuf);
  }
  console.log('✓ Successfully wrote backCard.png (' + backBuf.length + ' bytes)');

  // =========================================================================
  // 3. STRAP BAND (512 x 2048) - EXACT alfari.my.id "Steve Marvin" STRAP
  // =========================================================================
  const bandW = 512;
  const bandH = 2048;
  const bandCvs = createCanvas(bandW, bandH);
  const bandCtx = bandCvs.getContext('2d');

  // Deep matte black woven fabric base
  bandCtx.fillStyle = '#0a0d14';
  bandCtx.fillRect(0, 0, bandW, bandH);

  // Subtle woven ribbon texture
  bandCtx.fillStyle = 'rgba(255, 255, 255, 0.025)';
  for (let y = 0; y < bandH; y += 6) {
    bandCtx.fillRect(0, y, bandW, 2);
  }

  // Double high-contrast white & silver edge stitches
  bandCtx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
  bandCtx.lineWidth = 6;
  bandCtx.strokeRect(20, 0, bandW - 40, bandH);

  bandCtx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
  bandCtx.lineWidth = 2.5;
  bandCtx.strokeRect(34, 0, bandW - 68, bandH);

  // Helper to draw Monogram (S) & Vertical Name at specific Y coordinate
  const drawBrandingSegment = (startY) => {
    const monoX = bandW / 2;
    const monoY = startY;
    const monoR = 64;

    // Outer crisp white ring
    bandCtx.strokeStyle = '#ffffff';
    bandCtx.lineWidth = 11;
    bandCtx.beginPath();
    bandCtx.arc(monoX, monoY, monoR, 0, Math.PI * 2);
    bandCtx.stroke();

    // Letter S inside circle
    bandCtx.fillStyle = '#ffffff';
    bandCtx.font = '900 82px sans-serif';
    bandCtx.textAlign = 'center';
    bandCtx.textBaseline = 'middle';
    bandCtx.fillText('S', monoX, monoY + 2);

    // Vertical Typography: Steve Marvin (reading top-to-bottom, unmirrored)
    bandCtx.save();
    bandCtx.translate(monoX, startY + 115);
    bandCtx.rotate(Math.PI / 2);

    bandCtx.textAlign = 'left';
    bandCtx.textBaseline = 'middle';

    // Primary Name: Steve Marvin
    bandCtx.fillStyle = '#ffffff';
    bandCtx.font = '900 62px sans-serif';
    bandCtx.shadowColor = 'rgba(0, 0, 0, 0.95)';
    bandCtx.shadowBlur = 10;
    bandCtx.shadowOffsetY = 3;
    bandCtx.fillText('Steve Marvin', 0, 0);

    bandCtx.restore();
  };

  // Repeating branding along the strap (Steve Marvin + Monogram S)
  // Segment 1: Upper strap (near top anchor)
  drawBrandingSegment(260);

  // Segment 2: Mid strap (visible when pulled / dragged)
  drawBrandingSegment(820);

  // Segment 3: Primary resting segment (visible directly above clamp - exact alfari.my.id placement!)
  drawBrandingSegment(1380);

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
