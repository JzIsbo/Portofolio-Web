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
  console.log('Generating high-res card assets for Steve Marvin...');

  // 1. FRONT CARD (1024 x 1440)
  const frontCvs = createCanvas(1024, 1440);
  const fCtx = frontCvs.getContext('2d');

  // Background dark gradient
  const bgGrad = fCtx.createLinearGradient(0, 0, 1024, 1440);
  bgGrad.addColorStop(0, '#0c101d');
  bgGrad.addColorStop(0.35, '#1e112e');
  bgGrad.addColorStop(0.7, '#140c24');
  bgGrad.addColorStop(1, '#080a12');
  fCtx.fillStyle = bgGrad;
  fCtx.fillRect(0, 0, 1024, 1440);

  // Background subtle grid
  fCtx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  fCtx.lineWidth = 1.5;
  for (let x = 40; x < 1024; x += 48) {
    fCtx.beginPath();
    fCtx.moveTo(x, 40);
    fCtx.lineTo(x, 1400);
    fCtx.stroke();
  }
  for (let y = 40; y < 1440; y += 48) {
    fCtx.beginPath();
    fCtx.moveTo(40, y);
    fCtx.lineTo(984, y);
    fCtx.stroke();
  }

  // Iridescent holographic vertical strip on left edge
  const holoGrad = fCtx.createLinearGradient(36, 0, 80, 1440);
  holoGrad.addColorStop(0, 'rgba(244, 63, 94, 0.85)');
  holoGrad.addColorStop(0.25, 'rgba(192, 132, 252, 0.85)');
  holoGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.85)');
  holoGrad.addColorStop(0.75, 'rgba(52, 211, 153, 0.85)');
  holoGrad.addColorStop(1, 'rgba(251, 191, 36, 0.85)');
  fCtx.fillStyle = holoGrad;
  fCtx.fillRect(36, 36, 36, 1368);

  fCtx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  fCtx.lineWidth = 2.5;
  for (let i = 0; i < 1440; i += 26) {
    fCtx.beginPath();
    fCtx.moveTo(36, i);
    fCtx.lineTo(72, i + 36);
    fCtx.stroke();
  }

  // Outer Vibrant Rose Border with rounded corners
  fCtx.strokeStyle = '#f43f5e';
  fCtx.lineWidth = 14;
  if (fCtx.roundRect) {
    fCtx.beginPath();
    fCtx.roundRect(24, 24, 976, 1392, 36);
    fCtx.stroke();
  } else {
    fCtx.strokeRect(24, 24, 976, 1392);
  }

  // Inner border
  fCtx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  fCtx.lineWidth = 2.5;
  if (fCtx.roundRect) {
    fCtx.beginPath();
    fCtx.roundRect(42, 42, 940, 1356, 26);
    fCtx.stroke();
  }

  // Top VIP Header Pill
  fCtx.fillStyle = 'rgba(244, 63, 94, 0.25)';
  fCtx.strokeStyle = 'rgba(244, 63, 94, 0.8)';
  fCtx.lineWidth = 3;
  fCtx.beginPath();
  if (fCtx.roundRect) fCtx.roundRect(110, 68, 804, 76, 38);
  else fCtx.rect(110, 68, 804, 76);
  fCtx.fill();
  fCtx.stroke();

  fCtx.fillStyle = '#fda4af';
  fCtx.font = 'bold 28px sans-serif';
  fCtx.textAlign = 'center';
  fCtx.fillText('• OFFICIAL VIP PASS | BRAND ACTIVATION •', 512, 116);

  // Portrait Photo Section
  const photoY = 410;
  const photoRadius = 180;

  // Photo ambient glow
  const glowGrad = fCtx.createRadialGradient(512, photoY, photoRadius * 0.8, 512, photoY, photoRadius * 1.35);
  glowGrad.addColorStop(0, 'rgba(244, 63, 94, 0.65)');
  glowGrad.addColorStop(1, 'rgba(244, 63, 94, 0)');
  fCtx.fillStyle = glowGrad;
  fCtx.beginPath();
  fCtx.arc(512, photoY, photoRadius * 1.35, 0, Math.PI * 2);
  fCtx.fill();

  // Load Steve Marvin's Photo
  const stevePhotoPath = path.join(assetsDir, 'steve_hd.png');
  const steveFallbackPath = path.join(assetsDir, 'steve.png');
  const photoPathToUse = fs.existsSync(stevePhotoPath) ? stevePhotoPath : steveFallbackPath;

  if (fs.existsSync(photoPathToUse)) {
    console.log('Loading Steve photo from:', photoPathToUse);
    const photo = await loadImage(photoPathToUse);
    fCtx.save();
    fCtx.beginPath();
    fCtx.arc(512, photoY, photoRadius, 0, Math.PI * 2);
    fCtx.closePath();
    fCtx.clip();
    fCtx.drawImage(photo, 512 - photoRadius, photoY - photoRadius, photoRadius * 2, photoRadius * 2);
    fCtx.restore();
  } else {
    console.warn('Steve photo not found at:', photoPathToUse);
  }

  // Border ring around photo
  fCtx.strokeStyle = '#f43f5e';
  fCtx.lineWidth = 12;
  fCtx.beginPath();
  fCtx.arc(512, photoY, photoRadius, 0, Math.PI * 2);
  fCtx.stroke();

  fCtx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  fCtx.lineWidth = 3;
  fCtx.beginPath();
  fCtx.arc(512, photoY, photoRadius + 10, 0, Math.PI * 2);
  fCtx.stroke();

  // Full Name (Huge, Bold, Ultra High Contrast)
  fCtx.fillStyle = '#ffffff';
  fCtx.font = '900 70px sans-serif';
  fCtx.textAlign = 'center';
  fCtx.fillText('STEVE MARVIN', 512, 695);

  // Role Title (Vibrant Rose / Coral)
  fCtx.fillStyle = '#fb7185';
  fCtx.font = 'bold 38px sans-serif';
  fCtx.fillText('SUPERVISOR BRAND ACTIVATION', 512, 755);

  // GOC Portfolio Brands Card Pill
  fCtx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  fCtx.strokeStyle = 'rgba(244, 63, 94, 0.5)';
  fCtx.lineWidth = 3;
  fCtx.beginPath();
  if (fCtx.roundRect) fCtx.roundRect(90, 805, 844, 78, 22);
  else fCtx.rect(90, 805, 844, 78);
  fCtx.fill();
  fCtx.stroke();

  fCtx.fillStyle = '#ffffff';
  fCtx.font = 'bold 32px sans-serif';
  fCtx.fillText('GOC (Purbasari • Amara • Onyx • CleanFace)', 512, 855);

  // Ex Kanzler Experience Badge
  fCtx.fillStyle = 'rgba(14, 165, 233, 0.18)';
  fCtx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
  fCtx.lineWidth = 2.5;
  fCtx.beginPath();
  if (fCtx.roundRect) fCtx.roundRect(140, 905, 744, 66, 33);
  else fCtx.rect(140, 905, 744, 66);
  fCtx.fill();
  fCtx.stroke();

  fCtx.fillStyle = '#93c5fd';
  fCtx.font = 'bold 28px sans-serif';
  fCtx.fillText('Ex KANZLER (Cimory Group)', 512, 948);

  // Tagline & Focus
  fCtx.fillStyle = '#cbd5e1';
  fCtx.font = 'bold 25px sans-serif';
  fCtx.fillText('EVENT MANAGEMENT • BRAND EXPERIENTIAL', 512, 1025);

  // High-Contrast Scannable VIP Barcode
  const barStartX = 140;
  const barY = 1085;
  const barHeight = 130;
  const barCount = 44;
  const barSpacing = (1024 - barStartX * 2) / barCount;

  for (let i = 0; i < barCount; i++) {
    const isThick = (i * 7) % 3 === 0;
    fCtx.fillStyle = i % 5 === 0 ? '#f43f5e' : '#ffffff';
    fCtx.fillRect(
      barStartX + i * barSpacing,
      barY,
      isThick ? barSpacing * 0.72 : barSpacing * 0.38,
      barHeight
    );
  }

  // Pass ID & Security Code
  fCtx.fillStyle = '#f1f5f9';
  fCtx.font = 'bold 28px monospace';
  fCtx.fillText('PASS ID: SM-GOC-2026-VIP', 512, 1265);

  fCtx.fillStyle = '#94a3b8';
  fCtx.font = '22px monospace';
  fCtx.fillText('SECURITY CLEARANCE: VIP ALL-ACCESS', 512, 1310);

  const frontBuf = frontCvs.toBuffer('image/png');
  fs.writeFileSync(path.join(assetsDir, 'frontCard.png'), frontBuf);
  fs.writeFileSync(path.join(assetsDir, 'frontCard-B_vIkGBe.png'), frontBuf);
  if (fs.existsSync(distAssetsDir)) {
    fs.writeFileSync(path.join(distAssetsDir, 'frontCard.png'), frontBuf);
    fs.writeFileSync(path.join(distAssetsDir, 'frontCard-B_vIkGBe.png'), frontBuf);
  }
  console.log('✓ Successfully wrote frontCard.png (' + frontBuf.length + ' bytes)');

  // 2. BACK CARD (1024 x 1440)
  const backCvs = createCanvas(1024, 1440);
  const bCtx = backCvs.getContext('2d');

  const bGrad = bCtx.createLinearGradient(0, 0, 1024, 1440);
  bGrad.addColorStop(0, '#0a0d18');
  bGrad.addColorStop(0.4, '#1c102a');
  bGrad.addColorStop(1, '#060810');
  bCtx.fillStyle = bGrad;
  bCtx.fillRect(0, 0, 1024, 1440);

  bCtx.strokeStyle = '#f43f5e';
  bCtx.lineWidth = 14;
  if (bCtx.roundRect) {
    bCtx.beginPath();
    bCtx.roundRect(24, 24, 976, 1392, 36);
    bCtx.stroke();
  } else {
    bCtx.strokeRect(24, 24, 976, 1392);
  }

  bCtx.fillStyle = '#ffffff';
  bCtx.font = '900 54px sans-serif';
  bCtx.textAlign = 'center';
  bCtx.fillText('STEVE MARVIN', 512, 110);

  bCtx.fillStyle = '#fb7185';
  bCtx.font = 'bold 30px sans-serif';
  bCtx.fillText('SUPERVISOR BRAND ACTIVATION', 512, 160);

  bCtx.fillStyle = 'rgba(244, 63, 94, 0.2)';
  bCtx.strokeStyle = 'rgba(244, 63, 94, 0.6)';
  bCtx.lineWidth = 2.5;
  bCtx.beginPath();
  if (bCtx.roundRect) bCtx.roundRect(140, 195, 744, 58, 29);
  else bCtx.rect(140, 195, 744, 58);
  bCtx.fill();
  bCtx.stroke();

  bCtx.fillStyle = '#fda4af';
  bCtx.font = 'bold 24px monospace';
  bCtx.fillText('CORE COMPETENCIES & TRACK RECORD', 512, 233);

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
    const itemY = 330 + idx * 70;

    bCtx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    bCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    bCtx.lineWidth = 1.5;
    bCtx.beginPath();
    if (bCtx.roundRect) bCtx.roundRect(80, itemY - 40, 864, 56, 14);
    else bCtx.rect(80, itemY - 40, 864, 56);
    bCtx.fill();
    bCtx.stroke();

    bCtx.fillStyle = '#f8fafc';
    bCtx.font = 'bold 28px sans-serif';
    bCtx.fillText(skill, 110, itemY);
  });

  // Brands Box
  const boxY = 845;
  bCtx.fillStyle = 'rgba(244, 63, 94, 0.16)';
  bCtx.strokeStyle = 'rgba(244, 63, 94, 0.5)';
  bCtx.lineWidth = 3;
  bCtx.beginPath();
  if (bCtx.roundRect) bCtx.roundRect(80, boxY, 864, 205, 24);
  else bCtx.rect(80, boxY, 864, 205);
  bCtx.fill();
  bCtx.stroke();

  bCtx.fillStyle = '#fda4af';
  bCtx.font = 'bold 26px monospace';
  bCtx.textAlign = 'center';
  bCtx.fillText('PORTFOLIO BRANDS', 512, boxY + 50);

  bCtx.fillStyle = '#ffffff';
  bCtx.font = 'bold 36px sans-serif';
  bCtx.fillText('Purbasari • CleanFace • Amara • Onyx', 512, boxY + 112);

  bCtx.fillStyle = '#93c5fd';
  bCtx.font = 'bold 28px monospace';
  bCtx.fillText('Ex KANZLER (Cimory Group)', 512, boxY + 166);

  // Authenticated Pass Seal with simulated QR
  const authY = 1085;
  bCtx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  bCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  bCtx.lineWidth = 2;
  bCtx.beginPath();
  if (bCtx.roundRect) bCtx.roundRect(140, authY, 744, 165, 20);
  else bCtx.rect(140, authY, 744, 165);
  bCtx.fill();
  bCtx.stroke();

  const qrSize = 110;
  const qrX = 180;
  const qrY = authY + 28;
  bCtx.fillStyle = '#ffffff';
  bCtx.fillRect(qrX, qrY, qrSize, qrSize);
  bCtx.fillStyle = '#0f172a';
  bCtx.fillRect(qrX + 6, qrY + 6, qrSize - 12, qrSize - 12);
  bCtx.fillStyle = '#ffffff';
  bCtx.fillRect(qrX + 14, qrY + 14, 24, 24);
  bCtx.fillRect(qrX + qrSize - 38, qrY + 14, 24, 24);
  bCtx.fillRect(qrX + 14, qrY + qrSize - 38, 24, 24);
  bCtx.fillRect(qrX + 48, qrY + 26, 12, 12);
  bCtx.fillRect(qrX + 28, qrY + 54, 12, 12);
  bCtx.fillRect(qrX + 58, qrY + 58, 20, 20);

  bCtx.textAlign = 'left';
  bCtx.fillStyle = '#22c55e';
  bCtx.font = 'bold 28px monospace';
  bCtx.fillText('✔ AUTHENTICATED PASS', 330, authY + 68);

  bCtx.fillStyle = '#e2e8f0';
  bCtx.font = 'bold 24px monospace';
  bCtx.fillText('GOC BRAND ACTIVATION TEAM', 330, authY + 105);

  bCtx.fillStyle = '#94a3b8';
  bCtx.font = '20px monospace';
  bCtx.fillText('SCAN TO CONNECT & VERIFY', 330, authY + 140);

  const backBuf = backCvs.toBuffer('image/png');
  fs.writeFileSync(path.join(assetsDir, 'backCard.png'), backBuf);
  fs.writeFileSync(path.join(assetsDir, 'backCard-BGPpqBds.png'), backBuf);
  if (fs.existsSync(distAssetsDir)) {
    fs.writeFileSync(path.join(distAssetsDir, 'backCard.png'), backBuf);
    fs.writeFileSync(path.join(distAssetsDir, 'backCard-BGPpqBds.png'), backBuf);
  }
  console.log('✓ Successfully wrote backCard.png (' + backBuf.length + ' bytes)');

  // 3. STRAP BAND (1024 x 248)
  const bandCvs = createCanvas(1024, 248);
  const bandCtx = bandCvs.getContext('2d');

  bandCtx.fillStyle = '#0b0e18';
  bandCtx.fillRect(0, 0, 1024, 248);

  // Micro weave pattern
  bandCtx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  for (let x = 0; x < 1024; x += 6) {
    for (let y = 0; y < 248; y += 6) {
      if ((x + y) % 12 === 0) {
        bandCtx.fillRect(x, y, 3, 3);
      }
    }
  }

  // Edge neon stitching
  bandCtx.strokeStyle = '#f43f5e';
  bandCtx.lineWidth = 10;
  bandCtx.beginPath();
  bandCtx.moveTo(0, 14);
  bandCtx.lineTo(1024, 14);
  bandCtx.moveTo(0, 234);
  bandCtx.lineTo(1024, 234);
  bandCtx.stroke();

  // White inner stitch
  bandCtx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  bandCtx.lineWidth = 3;
  bandCtx.setLineDash([14, 10]);
  bandCtx.beginPath();
  bandCtx.moveTo(0, 26);
  bandCtx.lineTo(1024, 26);
  bandCtx.moveTo(0, 222);
  bandCtx.lineTo(1024, 222);
  bandCtx.stroke();
  bandCtx.setLineDash([]);

  // Monogram circle (S)
  const monoX = 100;
  const monoY = 124;
  const monoR = 56;

  bandCtx.fillStyle = '#f43f5e';
  bandCtx.beginPath();
  bandCtx.arc(monoX, monoY, monoR, 0, Math.PI * 2);
  bandCtx.fill();

  bandCtx.strokeStyle = '#ffffff';
  bandCtx.lineWidth = 5;
  bandCtx.beginPath();
  bandCtx.arc(monoX, monoY, monoR - 3, 0, Math.PI * 2);
  bandCtx.stroke();

  bandCtx.fillStyle = '#ffffff';
  bandCtx.font = '900 60px sans-serif';
  bandCtx.textAlign = 'center';
  bandCtx.textBaseline = 'middle';
  bandCtx.fillText('S', monoX, monoY + 2);

  // Bold typography
  bandCtx.textAlign = 'left';
  bandCtx.font = '900 48px sans-serif';
  bandCtx.fillStyle = '#ffffff';
  bandCtx.fillText('STEVE MARVIN', 185, monoY);

  bandCtx.fillStyle = '#fb7185';
  bandCtx.font = 'bold 30px sans-serif';
  bandCtx.fillText('• BRAND ACTIVATION', 620, monoY);

  const bandBuf = bandCvs.toBuffer('image/png');
  fs.writeFileSync(path.join(assetsDir, 'band.png'), bandBuf);
  fs.writeFileSync(path.join(assetsDir, 'bandd-aEExZUcs.png'), bandBuf);
  if (fs.existsSync(distAssetsDir)) {
    fs.writeFileSync(path.join(distAssetsDir, 'band.png'), bandBuf);
    fs.writeFileSync(path.join(distAssetsDir, 'bandd-aEExZUcs.png'), bandBuf);
  }
  console.log('✓ Successfully wrote band.png (' + bandBuf.length + ' bytes)');
}

generateAssets().catch(err => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
