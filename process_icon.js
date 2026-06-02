import sharp from 'sharp';
import fs from 'fs';

async function processIcons() {
  const original = 'public/pwa-512x512.png';
  
  // Get background color from top-left pixel
  const { data } = await sharp(original)
    .extract({ left: 0, top: 0, width: 1, height: 1 })
    .raw()
    .toBuffer({ resolveWithObject: true });
  
  const bgColor = { r: data[0], g: data[1], b: data[2], alpha: 1 };
  
  console.log('Detected background color:', bgColor);

  // 1. Create maskable icon (padding for Android)
  // We'll resize the original to 340x340, and extend it to 512x512 with the bgColor.
  await sharp(original)
    .resize(340, 340)
    .extend({
      top: 86,
      bottom: 86,
      left: 86,
      right: 86,
      background: bgColor
    })
    .toFile('public/maskable-icon.png');
  console.log('Created maskable-icon.png with padding');

  // 2. Create PC / Apple rounded corners icons
  const rectSvg = Buffer.from(
    `<svg width="512" height="512"><rect x="0" y="0" width="512" height="512" rx="100" ry="100" /></svg>`
  );

  const roundedIcon = await sharp(original)
    .resize(512, 512)
    .composite([{
      input: rectSvg,
      blend: 'dest-in'
    }])
    .png();

  await roundedIcon.toFile('public/pwa-512x512_rounded.png');
  // Need to resize the roundedIcon buffer, not the promise
  const roundedBuffer = await roundedIcon.toBuffer();
  await sharp(roundedBuffer).resize(192, 192).toFile('public/pwa-192x192_rounded.png');
  await sharp(roundedBuffer).toFile('public/apple-touch-icon_rounded.png');
  console.log('Created rounded icons');
}

processIcons().catch(console.error);
