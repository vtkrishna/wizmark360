import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generatePDF() {
  const mdPath = path.join(__dirname, '../docs/Market360_Complete_Product_Features.md');
  const outputPath = path.join(__dirname, '../docs/Market360_Complete_Product_Features.pdf');
  
  const markdown = fs.readFileSync(mdPath, 'utf-8');
  const htmlContent = marked(markdown);
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      max-width: 900px;
      margin: 0 auto;
      padding: 40px;
      color: #333;
    }
    h1 {
      color: #1a1a2e;
      border-bottom: 3px solid #4a4a8a;
      padding-bottom: 10px;
      font-size: 28px;
    }
    h2 {
      color: #2d2d5a;
      border-bottom: 1px solid #ddd;
      padding-bottom: 8px;
      margin-top: 30px;
      font-size: 22px;
    }
    h3 {
      color: #4a4a8a;
      margin-top: 20px;
      font-size: 18px;
    }
    h4 {
      color: #666;
      font-size: 16px;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 15px 0;
      font-size: 12px;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px 12px;
      text-align: left;
    }
    th {
      background-color: #4a4a8a;
      color: white;
    }
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    code {
      background-color: #f4f4f4;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Consolas', monospace;
      font-size: 12px;
    }
    pre {
      background-color: #1e1e3f;
      color: #a9b7c6;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
      font-size: 11px;
      line-height: 1.4;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    pre code {
      background: none;
      padding: 0;
      color: inherit;
    }
    blockquote {
      border-left: 4px solid #4a4a8a;
      margin: 15px 0;
      padding: 10px 20px;
      background-color: #f9f9fc;
    }
    ul, ol {
      margin: 10px 0;
      padding-left: 25px;
    }
    li {
      margin: 5px 0;
    }
    hr {
      border: none;
      border-top: 2px solid #eee;
      margin: 30px 0;
    }
    strong {
      color: #2d2d5a;
    }
    a {
      color: #4a4a8a;
      text-decoration: none;
    }
  </style>
</head>
<body>
${htmlContent}
</body>
</html>
  `;
  
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });
  
  console.log('Creating page...');
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  
  console.log('Generating PDF...');
  await page.pdf({
    path: outputPath,
    format: 'A4',
    margin: {
      top: '20mm',
      right: '15mm',
      bottom: '20mm',
      left: '15mm'
    },
    printBackground: true
  });
  
  await browser.close();
  
  console.log('PDF generated successfully:', outputPath);
}

generatePDF().catch(err => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
