const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function generatePDF() {
  console.log('📄 Starting PDF generation...');
  
  const { marked } = await import('marked');
  
  const markdownPath = path.join(__dirname, '../docs/MARKET360_PRODUCT_FEATURES.md');
  const outputPath = path.join(__dirname, '../docs/Market360_Product_Features.pdf');
  
  let markdown = fs.readFileSync(markdownPath, 'utf-8');
  
  marked.setOptions({
    breaks: true,
    gfm: true
  });
  
  const htmlContent = marked(markdown);
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Market360 - Product Feature Document</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 11px;
      line-height: 1.6;
      color: #1a1a2e;
      background: #ffffff;
      padding: 0;
    }
    
    .cover-page {
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
      color: white;
      text-align: center;
      page-break-after: always;
      padding: 60px;
      position: relative;
    }
    
    .cover-logo {
      width: 120px;
      height: 120px;
      background: rgba(255,255,255,0.2);
      border-radius: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 48px;
      font-weight: 800;
      margin-bottom: 40px;
      backdrop-filter: blur(10px);
      border: 2px solid rgba(255,255,255,0.3);
    }
    
    .cover-title {
      font-size: 56px;
      font-weight: 800;
      margin-bottom: 16px;
      text-shadow: 0 4px 20px rgba(0,0,0,0.3);
      border: none;
      color: white;
    }
    
    .cover-subtitle {
      font-size: 24px;
      font-weight: 400;
      opacity: 0.9;
      margin-bottom: 40px;
    }
    
    .cover-stats {
      display: flex;
      gap: 30px;
      margin-top: 40px;
    }
    
    .cover-stat {
      background: rgba(255,255,255,0.15);
      padding: 20px 30px;
      border-radius: 16px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.2);
    }
    
    .cover-stat-value {
      font-size: 32px;
      font-weight: 800;
    }
    
    .cover-stat-label {
      font-size: 12px;
      opacity: 0.8;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .cover-date {
      position: absolute;
      bottom: 40px;
      font-size: 14px;
      opacity: 0.7;
    }
    
    .content {
      padding: 40px 50px;
    }
    
    h1 {
      font-size: 28px;
      font-weight: 800;
      color: #667eea;
      margin: 40px 0 20px 0;
      padding-bottom: 12px;
      border-bottom: 3px solid #667eea;
      page-break-after: avoid;
    }
    
    h1:first-of-type {
      margin-top: 0;
    }
    
    h2 {
      font-size: 20px;
      font-weight: 700;
      color: #1a1a2e;
      margin: 30px 0 15px 0;
      padding-left: 12px;
      border-left: 4px solid #764ba2;
      page-break-after: avoid;
    }
    
    h3 {
      font-size: 16px;
      font-weight: 600;
      color: #4a4a6a;
      margin: 20px 0 12px 0;
      page-break-after: avoid;
    }
    
    h4 {
      font-size: 14px;
      font-weight: 600;
      color: #667eea;
      margin: 16px 0 10px 0;
    }
    
    p {
      margin: 12px 0;
      text-align: justify;
    }
    
    strong {
      color: #1a1a2e;
      font-weight: 600;
    }
    
    ul, ol {
      margin: 12px 0;
      padding-left: 24px;
    }
    
    li {
      margin: 6px 0;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 10px;
      page-break-inside: avoid;
    }
    
    th {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 10px;
      text-align: left;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-size: 9px;
    }
    
    td {
      padding: 10px;
      border-bottom: 1px solid #e8e8f0;
      vertical-align: top;
    }
    
    tr:nth-child(even) {
      background: #f8f8fc;
    }
    
    tr:hover {
      background: #f0f0f8;
    }
    
    code {
      background: #f4f4f8;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'SF Mono', Consolas, monospace;
      font-size: 10px;
      color: #764ba2;
    }
    
    pre {
      background: linear-gradient(135deg, #1a1a2e 0%, #2d2d44 100%);
      color: #e8e8f0;
      padding: 20px;
      border-radius: 12px;
      overflow-x: auto;
      margin: 20px 0;
      font-family: 'SF Mono', Consolas, monospace;
      font-size: 9px;
      line-height: 1.5;
      page-break-inside: avoid;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    
    pre code {
      background: none;
      color: inherit;
      padding: 0;
    }
    
    blockquote {
      border-left: 4px solid #667eea;
      padding: 15px 20px;
      margin: 20px 0;
      background: linear-gradient(90deg, #f8f8fc 0%, #ffffff 100%);
      border-radius: 0 8px 8px 0;
      font-style: italic;
      color: #4a4a6a;
    }
    
    hr {
      border: none;
      height: 2px;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
      margin: 40px 0;
      border-radius: 2px;
    }
    
    .diagram-box {
      background: #f8f8fc;
      border: 2px solid #e8e8f0;
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
      page-break-inside: avoid;
    }
    
    .highlight-box {
      background: linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%);
      border: 1px solid rgba(102,126,234,0.3);
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
    }
    
    @page {
      margin: 0.5in;
      size: A4;
    }
    
    @media print {
      .cover-page {
        margin: -0.5in;
        padding: 60px;
        width: calc(100% + 1in);
      }
      
      h1, h2, h3 {
        page-break-after: avoid;
      }
      
      pre, table, .diagram-box {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="cover-page">
    <div class="cover-logo">M360</div>
    <h1 class="cover-title">Market360</h1>
    <p class="cover-subtitle">Self-Driving Agency Platform<br>Complete Product Feature Document</p>
    
    <div class="cover-stats">
      <div class="cover-stat">
        <div class="cover-stat-value">23</div>
        <div class="cover-stat-label">LLM Providers</div>
      </div>
      <div class="cover-stat">
        <div class="cover-stat-value">752</div>
        <div class="cover-stat-label">AI Models</div>
      </div>
      <div class="cover-stat">
        <div class="cover-stat-value">267</div>
        <div class="cover-stat-label">Agents</div>
      </div>
      <div class="cover-stat">
        <div class="cover-stat-value">12+</div>
        <div class="cover-stat-label">Languages</div>
      </div>
    </div>
    
    <p class="cover-date">December 2025 | Version 1.0 | Confidential</p>
  </div>
  
  <div class="content">
    ${htmlContent}
  </div>
</body>
</html>
`;

  console.log('🚀 Launching browser...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });
  
  const page = await browser.newPage();
  
  await page.setContent(html, { 
    waitUntil: 'networkidle0',
    timeout: 60000
  });
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('📝 Generating PDF...');
  
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '0.5in',
      right: '0.5in',
      bottom: '0.7in',
      left: '0.5in'
    },
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `
      <div style="width: 100%; font-size: 9px; padding: 0 40px; display: flex; justify-content: space-between; color: #8a8a9a; font-family: Arial, sans-serif;">
        <span>Market360 - Self-Driving Agency Platform</span>
        <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        <span>December 2025</span>
      </div>
    `
  });
  
  await browser.close();
  
  console.log('✅ PDF generated successfully!');
  console.log('📁 Output: ' + outputPath);
  
  const stats = fs.statSync(outputPath);
  console.log('📊 File size: ' + (stats.size / 1024 / 1024).toFixed(2) + ' MB');
}

generatePDF().catch(console.error);
