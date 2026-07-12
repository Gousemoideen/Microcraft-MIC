import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

async function diagnose() {
  const fontRegularPath = 'public/fonts/NotoSans-Regular.ttf';
  const fontTamilPath = 'public/fonts/NotoSansTamil-Regular.ttf';
  const templatePath = 'public/templates/Google.jpg';
  const logoPath = 'public/mic-logo.png';
  
  console.log('Font Regular Size:', fs.readFileSync(fontRegularPath).length);
  console.log('Font Tamil Size:', fs.readFileSync(fontTamilPath).length);
  console.log('Template Size:', fs.readFileSync(templatePath).length);
  console.log('Logo Size:', fs.existsSync(logoPath) ? fs.readFileSync(logoPath).length : 'None');
  
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  
  const customFontRegular = await pdfDoc.embedFont(fs.readFileSync(fontRegularPath));
  const customFontTamil = await pdfDoc.embedFont(fs.readFileSync(fontTamilPath));
  
  let page;
  let templateImage = null;
  let logoImage = null;
  
  const exists = fs.existsSync(templatePath);
  console.log('Template path exists in loop:', exists);
  
  if (exists) {
    console.log('Running: embedJpg');
    page = pdfDoc.addPage([841.89, 595.27]);
    const imgBytes = fs.readFileSync(templatePath);
    templateImage = await pdfDoc.embedJpg(imgBytes);
    page.drawImage(templateImage, {
      x: 0,
      y: 0,
      width: 841.89,
      height: 595.27,
    });
    console.log('Template Image embedded and drawn.');
  } else {
    console.log('Running: Vector Fallback');
    page = pdfDoc.addPage([841.89, 595.27]);
  }
  
  const savedBytes = await pdfDoc.save();
  console.log('Output PDF size with only template & fonts:', savedBytes.length);
}

diagnose().catch(console.error);
