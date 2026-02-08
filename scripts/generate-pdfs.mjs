import puppeteer from 'puppeteer';
import { marked } from 'marked';
import fs from 'fs';
import path from 'path';

const CHROMIUM_PATH = '/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium';

async function generatePDF(inputPath, outputPath, config) {
  console.log(`\n📄 Generating: ${path.basename(outputPath)}`);

  const markdown = fs.readFileSync(inputPath, 'utf-8');
  const htmlContent = marked(markdown);

  const fullHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; }

  body {
    font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
    font-size: 10.5pt;
    line-height: 1.6;
    color: #1E293B;
    max-width: 100%;
    margin: 0;
    padding: 0;
  }

  .cover-page {
    page-break-after: always;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 88vh;
    text-align: center;
    padding: 1.5in 0.8in;
  }

  .cover-logo {
    font-size: 40pt;
    font-weight: 800;
    color: #1E3A8A;
    letter-spacing: -1px;
    margin-bottom: 6px;
  }

  .cover-tagline {
    font-size: 12pt;
    color: #D97706;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 3px;
    margin-bottom: 35px;
  }

  .cover-title {
    font-size: 20pt;
    font-weight: 700;
    color: #0F172A;
    margin-bottom: 10px;
    line-height: 1.2;
  }

  .cover-subtitle {
    font-size: 11pt;
    color: #475569;
    font-weight: 400;
    margin-bottom: 40px;
    white-space: pre-line;
  }

  .cover-stats {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin: 25px 0;
    flex-wrap: wrap;
  }

  .stat-box {
    text-align: center;
    padding: 10px 14px;
    border: 1px solid #E2E8F0;
    border-radius: 8px;
    background: linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%);
    min-width: 75px;
  }

  .stat-number {
    font-size: 18pt;
    font-weight: 800;
    color: #1E3A8A;
    display: block;
  }

  .stat-label {
    font-size: 7pt;
    color: #64748B;
    text-transform: uppercase;
    letter-spacing: 0.8px;
  }

  .cover-meta {
    font-size: 8.5pt;
    color: #94A3B8;
    border-top: 1px solid #E2E8F0;
    padding-top: 18px;
    margin-top: 30px;
  }

  h1 {
    font-size: 20pt;
    color: #1E3A8A;
    font-weight: 800;
    border-bottom: 3px solid #D97706;
    padding-bottom: 6px;
    margin-top: 28px;
    margin-bottom: 14px;
    page-break-after: avoid;
  }

  h2 {
    font-size: 15pt;
    color: #1E3A8A;
    font-weight: 700;
    border-bottom: 1.5px solid #BFDBFE;
    padding-bottom: 4px;
    margin-top: 20px;
    margin-bottom: 10px;
    page-break-after: avoid;
  }

  h3 {
    font-size: 12pt;
    color: #1E40AF;
    font-weight: 600;
    margin-top: 16px;
    margin-bottom: 6px;
    page-break-after: avoid;
  }

  h4 {
    font-size: 10.5pt;
    color: #1D4ED8;
    font-weight: 600;
    margin-top: 12px;
    margin-bottom: 5px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0 14px 0;
    font-size: 9pt;
    page-break-inside: auto;
  }

  thead { display: table-header-group; }
  tr { page-break-inside: avoid; }

  th {
    background: linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 100%);
    color: white;
    font-weight: 600;
    padding: 7px 8px;
    text-align: left;
    font-size: 8.5pt;
    letter-spacing: 0.2px;
  }

  td {
    padding: 5px 8px;
    border-bottom: 1px solid #E2E8F0;
    vertical-align: top;
  }

  tr:nth-child(even) { background-color: #F8FAFC; }

  pre {
    background: #0F172A;
    color: #E2E8F0;
    padding: 12px 14px;
    border-radius: 5px;
    font-size: 8pt;
    line-height: 1.45;
    overflow-x: auto;
    margin: 8px 0;
    border-left: 3px solid #D97706;
    page-break-inside: avoid;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  code {
    font-family: 'Cascadia Code', 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 8.5pt;
  }

  p code {
    background: #EFF6FF;
    color: #1E40AF;
    padding: 1px 4px;
    border-radius: 3px;
    font-size: 8.5pt;
  }

  ul, ol {
    padding-left: 18px;
    margin: 5px 0;
  }

  li {
    margin-bottom: 2px;
    line-height: 1.5;
  }

  blockquote {
    border-left: 3px solid #D97706;
    background: #FFFBEB;
    padding: 8px 14px;
    margin: 10px 0;
    border-radius: 0 5px 5px 0;
    color: #92400E;
    font-style: italic;
  }

  hr {
    border: none;
    border-top: 2px solid #E2E8F0;
    margin: 20px 0;
  }

  a { color: #1D4ED8; text-decoration: none; }
  strong { color: #0F172A; font-weight: 700; }
  img { max-width: 100%; }
</style>
</head>
<body>

<div class="cover-page">
  <div class="cover-logo">WizMark 360</div>
  <div class="cover-tagline">By Wizards360</div>
  <div class="cover-title">${config.title}</div>
  <div class="cover-subtitle">${config.subtitle}</div>
  <div class="cover-stats">
    <div class="stat-box"><span class="stat-number">285</span><span class="stat-label">AI Agents</span></div>
    <div class="stat-box"><span class="stat-number">24</span><span class="stat-label">LLM Providers</span></div>
    <div class="stat-box"><span class="stat-number">886+</span><span class="stat-label">AI Models</span></div>
    <div class="stat-box"><span class="stat-number">8</span><span class="stat-label">Verticals</span></div>
    <div class="stat-box"><span class="stat-number">22</span><span class="stat-label">Languages</span></div>
    <div class="stat-box"><span class="stat-number">319</span><span class="stat-label">Services</span></div>
  </div>
  <div class="cover-meta">
    <strong>February 2026</strong> &nbsp;|&nbsp; Confidential &nbsp;|&nbsp; Version ${config.version}<br>
    The World's First AI Marketing Operating System
  </div>
</div>

${htmlContent}

</body>
</html>`;

  const browser = await puppeteer.launch({
    executablePath: CHROMIUM_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setContent(fullHtml, { waitUntil: 'networkidle0', timeout: 60000 });

  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div style="font-size:8px;color:#1E3A8A;width:100%;text-align:center;padding:4px 40px;"><span style="font-weight:600;">WizMark 360</span><span style="color:#94A3B8;margin:0 6px;">|</span><span style="color:#64748B;">' + config.headerTitle + '</span></div>',
    footerTemplate: '<div style="font-size:7px;width:100%;display:flex;justify-content:space-between;padding:4px 40px;color:#64748B;"><span>Wizards360 — Confidential</span><span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span><span style="color:#D97706;">February 2026</span></div>',
    margin: {
      top: '70px',
      bottom: '55px',
      left: '50px',
      right: '50px'
    }
  });

  await browser.close();

  const stats = fs.statSync(outputPath);
  const sizeKB = Math.round(stats.size / 1024);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`  ✅ Generated: ${outputPath} (${sizeKB > 1024 ? sizeMB + ' MB' : sizeKB + ' KB'})`);
}

async function main() {
  console.log('==============================================');
  console.log('  WizMark 360 — Professional PDF Generator');
  console.log('==============================================');

  try {
    await generatePDF(
      'docs/WizMark-360-Investor-Presentation.md',
      'docs/pdf/WizMark-360-Investor-Presentation.pdf',
      {
        title: 'Investor Presentation',
        subtitle: 'Series A — The World\'s First AI Marketing Operating System\n285 Agents • 24 LLM Providers • 886+ Models • 8 Verticals • 22 Languages',
        headerTitle: 'Investor Presentation — Series A',
        version: '4.5.0'
      }
    );

    await generatePDF(
      'docs/WizMark-360-Product-Note.md',
      'docs/pdf/WizMark-360-Product-Note.pdf',
      {
        title: 'Product Note',
        subtitle: 'Complete Platform Features, Capabilities & Workflows\n319 Service Modules • 178 API Routes • Enterprise-Grade AI Marketing',
        headerTitle: 'Product Note — Platform Features',
        version: '4.5.0'
      }
    );

    console.log('\n==============================================');
    console.log('  ✅ All PDFs Generated Successfully!');
    console.log('==============================================\n');

    const files = fs.readdirSync('docs/pdf').filter(f => f.endsWith('.pdf'));
    for (const f of files) {
      const stats = fs.statSync(path.join('docs/pdf', f));
      const sizeKB = Math.round(stats.size / 1024);
      console.log(`  📄 ${f} — ${sizeKB} KB`);
    }
  } catch (err) {
    console.error('PDF generation failed:', err);
    process.exit(1);
  }
}

main();
