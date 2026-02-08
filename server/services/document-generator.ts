import * as fs from 'fs';
import * as path from 'path';
import puppeteer from 'puppeteer';
import { marked } from 'marked';
import { nanoid } from 'nanoid';

const CHROMIUM_PATH = '/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium';
const GENERATED_DOCS_DIR = path.resolve('generated-docs');

export interface DocumentRequest {
  title: string;
  content: string;
  type: 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'csv' | 'html';
  brandContext?: {
    brandName?: string;
    primaryColor?: string;
    secondaryColor?: string;
    logo?: string;
  };
  metadata?: Record<string, any>;
}

export interface GeneratedDocument {
  id: string;
  filename: string;
  path: string;
  size: number;
  format: string;
  downloadUrl: string;
  createdAt: Date;
}

interface ShareLink {
  shareId: string;
  documentId: string;
  createdAt: Date;
  expiresAt?: Date;
}

const documentsStore: Map<string, GeneratedDocument> = new Map();
const shareLinks: Map<string, ShareLink> = new Map();

function ensureOutputDir(): void {
  if (!fs.existsSync(GENERATED_DOCS_DIR)) {
    fs.mkdirSync(GENERATED_DOCS_DIR, { recursive: true });
  }
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_\-\s]/g, '').replace(/\s+/g, '_').slice(0, 100);
}

function buildHtmlShell(title: string, body: string, brand?: DocumentRequest['brandContext']): string {
  const primaryColor = brand?.primaryColor || '#1E3A8A';
  const secondaryColor = brand?.secondaryColor || '#D97706';
  const brandName = brand?.brandName || '';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${title}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
    font-size: 11pt;
    line-height: 1.6;
    color: #1E293B;
    padding: 40px 50px;
  }
  .header {
    border-bottom: 3px solid ${primaryColor};
    padding-bottom: 12px;
    margin-bottom: 24px;
  }
  .header h1 {
    font-size: 24pt;
    color: ${primaryColor};
    font-weight: 800;
  }
  .header .brand {
    font-size: 10pt;
    color: ${secondaryColor};
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 2px;
  }
  h1 { font-size: 20pt; color: ${primaryColor}; font-weight: 800; border-bottom: 3px solid ${secondaryColor}; padding-bottom: 6px; margin-top: 28px; margin-bottom: 14px; }
  h2 { font-size: 15pt; color: ${primaryColor}; font-weight: 700; border-bottom: 1.5px solid #BFDBFE; padding-bottom: 4px; margin-top: 20px; margin-bottom: 10px; }
  h3 { font-size: 12pt; color: #1E40AF; font-weight: 600; margin-top: 16px; margin-bottom: 6px; }
  h4 { font-size: 10.5pt; color: #1D4ED8; font-weight: 600; margin-top: 12px; margin-bottom: 5px; }
  table { width: 100%; border-collapse: collapse; margin: 10px 0 14px 0; font-size: 9pt; }
  th { background: linear-gradient(135deg, ${primaryColor} 0%, #1D4ED8 100%); color: white; font-weight: 600; padding: 7px 8px; text-align: left; font-size: 8.5pt; }
  td { padding: 5px 8px; border-bottom: 1px solid #E2E8F0; vertical-align: top; }
  tr:nth-child(even) { background-color: #F8FAFC; }
  pre { background: #0F172A; color: #E2E8F0; padding: 12px 14px; border-radius: 5px; font-size: 8pt; line-height: 1.45; overflow-x: auto; margin: 8px 0; border-left: 3px solid ${secondaryColor}; white-space: pre-wrap; word-wrap: break-word; }
  code { font-family: 'Cascadia Code', 'JetBrains Mono', 'Fira Code', monospace; font-size: 8.5pt; }
  p code { background: #EFF6FF; color: #1E40AF; padding: 1px 4px; border-radius: 3px; }
  ul, ol { padding-left: 18px; margin: 5px 0; }
  li { margin-bottom: 2px; line-height: 1.5; }
  blockquote { border-left: 3px solid ${secondaryColor}; background: #FFFBEB; padding: 8px 14px; margin: 10px 0; border-radius: 0 5px 5px 0; color: #92400E; font-style: italic; }
  hr { border: none; border-top: 2px solid #E2E8F0; margin: 20px 0; }
  a { color: #1D4ED8; text-decoration: none; }
  strong { color: #0F172A; font-weight: 700; }
  p { margin: 6px 0; }
  .footer { margin-top: 40px; padding-top: 12px; border-top: 1px solid #E2E8F0; font-size: 8pt; color: #94A3B8; text-align: center; }
</style>
</head>
<body>
<div class="header">
  ${brandName ? `<div class="brand">${brandName}</div>` : ''}
  <h1>${title}</h1>
</div>
${body}
<div class="footer">
  ${brandName ? `${brandName} — ` : ''}Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
</div>
</body>
</html>`;
}

export async function generatePDF(request: DocumentRequest): Promise<GeneratedDocument> {
  ensureOutputDir();
  const id = nanoid();
  const filename = `${sanitizeFilename(request.title)}_${id}.pdf`;
  const filePath = path.join(GENERATED_DOCS_DIR, filename);

  const htmlContent = await marked(request.content);
  const fullHtml = buildHtmlShell(request.title, htmlContent, request.brandContext);

  const primaryColor = request.brandContext?.primaryColor || '#1E3A8A';
  const brandName = request.brandContext?.brandName || '';

  const browser = await puppeteer.launch({
    executablePath: CHROMIUM_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setContent(fullHtml, { waitUntil: 'networkidle0', timeout: 30000 });

  await page.pdf({
    path: filePath,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: `<div style="font-size:8px;color:${primaryColor};width:100%;text-align:center;padding:4px 40px;"><span style="font-weight:600;">${brandName}</span>${brandName ? '<span style="color:#94A3B8;margin:0 6px;">|</span>' : ''}<span style="color:#64748B;">${request.title}</span></div>`,
    footerTemplate: `<div style="font-size:7px;width:100%;display:flex;justify-content:space-between;padding:4px 40px;color:#64748B;"><span>${brandName}</span><span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span><span>${new Date().toLocaleDateString()}</span></div>`,
    margin: { top: '70px', bottom: '55px', left: '50px', right: '50px' }
  });

  await browser.close();

  const stats = fs.statSync(filePath);
  const doc: GeneratedDocument = {
    id,
    filename,
    path: filePath,
    size: stats.size,
    format: 'pdf',
    downloadUrl: `/api/export/${id}/download`,
    createdAt: new Date()
  };

  documentsStore.set(id, doc);
  return doc;
}

export async function generateDOCX(request: DocumentRequest): Promise<GeneratedDocument> {
  ensureOutputDir();
  const id = nanoid();
  const filename = `${sanitizeFilename(request.title)}_${id}.docx`;
  const filePath = path.join(GENERATED_DOCS_DIR, filename);

  const htmlContent = await marked(request.content);
  const fullHtml = buildHtmlShell(request.title, htmlContent, request.brandContext);

  const docxWrapper = `MIME-Version: 1.0
Content-Type: multipart/related; boundary="----=_NextPart_boundary"

------=_NextPart_boundary
Content-Type: text/html; charset="utf-8"
Content-Transfer-Encoding: quoted-printable

${fullHtml}

------=_NextPart_boundary--`;

  fs.writeFileSync(filePath, docxWrapper, 'utf-8');

  const stats = fs.statSync(filePath);
  const doc: GeneratedDocument = {
    id,
    filename,
    path: filePath,
    size: stats.size,
    format: 'docx',
    downloadUrl: `/api/export/${id}/download`,
    createdAt: new Date()
  };

  documentsStore.set(id, doc);
  return doc;
}

export async function generateXLSX(request: DocumentRequest): Promise<GeneratedDocument> {
  ensureOutputDir();
  const id = nanoid();
  const filename = `${sanitizeFilename(request.title)}_${id}.csv`;
  const filePath = path.join(GENERATED_DOCS_DIR, filename);

  const lines = request.content.split('\n').filter(l => l.trim());
  const csvRows: string[] = [];

  for (const line of lines) {
    if (line.includes('|')) {
      const cells = line.split('|').map(c => c.trim()).filter(c => c && !c.match(/^[-:]+$/));
      if (cells.length > 0) {
        csvRows.push(cells.map(c => `"${c.replace(/"/g, '""')}"`).join(','));
      }
    } else {
      csvRows.push(`"${line.replace(/"/g, '""')}"`);
    }
  }

  if (csvRows.length === 0) {
    csvRows.push(`"${request.title}"`);
    csvRows.push(`"${request.content.replace(/"/g, '""')}"`);
  }

  fs.writeFileSync(filePath, csvRows.join('\n'), 'utf-8');

  const stats = fs.statSync(filePath);
  const doc: GeneratedDocument = {
    id,
    filename,
    path: filePath,
    size: stats.size,
    format: 'csv',
    downloadUrl: `/api/export/${id}/download`,
    createdAt: new Date()
  };

  documentsStore.set(id, doc);
  return doc;
}

export async function generatePPTX(request: DocumentRequest): Promise<GeneratedDocument> {
  ensureOutputDir();
  const id = nanoid();
  const filename = `${sanitizeFilename(request.title)}_${id}.html`;
  const filePath = path.join(GENERATED_DOCS_DIR, filename);

  const primaryColor = request.brandContext?.primaryColor || '#1E3A8A';
  const secondaryColor = request.brandContext?.secondaryColor || '#D97706';
  const brandName = request.brandContext?.brandName || '';

  const slides: string[] = [];
  const sections = request.content.split(/(?=^#{1,2}\s)/m);

  if (sections.length <= 1) {
    const paragraphs = request.content.split('\n\n').filter(p => p.trim());
    for (let i = 0; i < paragraphs.length; i++) {
      slides.push(paragraphs[i]);
    }
  } else {
    for (const section of sections) {
      if (section.trim()) {
        slides.push(section.trim());
      }
    }
  }

  if (slides.length === 0) {
    slides.push(request.content);
  }

  const slideHtmlParts = await Promise.all(slides.map(async (slide, index) => {
    const rendered = await marked(slide);
    return `<div class="slide" id="slide-${index}">
      <div class="slide-number">${index + 1} / ${slides.length}</div>
      <div class="slide-content">${rendered}</div>
    </div>`;
  }));

  const presentationHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${request.title}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; background: #0F172A; color: #E2E8F0; }
  .slide {
    width: 100vw; height: 100vh;
    display: flex; flex-direction: column; justify-content: center; align-items: center;
    padding: 60px 80px; position: relative;
    background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
    border-bottom: 4px solid ${primaryColor};
    page-break-after: always;
  }
  .slide:first-child {
    background: linear-gradient(135deg, ${primaryColor} 0%, #1D4ED8 100%);
  }
  .slide:first-child h1, .slide:first-child h2 { color: white; border: none; }
  .slide-content { max-width: 900px; width: 100%; }
  .slide-content h1 { font-size: 36pt; color: ${secondaryColor}; margin-bottom: 20px; border: none; }
  .slide-content h2 { font-size: 28pt; color: ${primaryColor}; margin-bottom: 16px; border: none; }
  .slide-content h3 { font-size: 20pt; color: #93C5FD; margin-bottom: 12px; }
  .slide-content p { font-size: 16pt; line-height: 1.8; margin-bottom: 12px; }
  .slide-content ul, .slide-content ol { font-size: 16pt; padding-left: 30px; }
  .slide-content li { margin-bottom: 8px; line-height: 1.6; }
  .slide-content table { width: 100%; border-collapse: collapse; margin: 16px 0; }
  .slide-content th { background: ${primaryColor}; color: white; padding: 10px 14px; text-align: left; font-size: 12pt; }
  .slide-content td { padding: 8px 14px; border-bottom: 1px solid #334155; font-size: 12pt; }
  .slide-content tr:nth-child(even) { background: rgba(255,255,255,0.05); }
  .slide-content code { background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; font-size: 14pt; }
  .slide-content pre { background: #020617; padding: 16px; border-radius: 8px; font-size: 11pt; overflow-x: auto; }
  .slide-content blockquote { border-left: 4px solid ${secondaryColor}; padding: 12px 20px; margin: 16px 0; background: rgba(255,255,255,0.05); border-radius: 0 8px 8px 0; font-style: italic; }
  .slide-content strong { color: ${secondaryColor}; }
  .slide-number { position: absolute; bottom: 20px; right: 40px; font-size: 10pt; color: #64748B; }
  .brand-label { position: absolute; bottom: 20px; left: 40px; font-size: 10pt; color: #64748B; text-transform: uppercase; letter-spacing: 2px; }
  @media print { .slide { page-break-after: always; } }
</style>
</head>
<body>
${slideHtmlParts.map(s => s.replace('</div>\n    </div>', `<div class="brand-label">${brandName}</div></div>`)).join('\n')}
<script>
  let current = 0;
  const slides = document.querySelectorAll('.slide');
  function showSlide(n) {
    slides.forEach((s, i) => { s.style.display = i === n ? 'flex' : 'none'; });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === ' ') { current = Math.min(current + 1, slides.length - 1); showSlide(current); }
    if (e.key === 'ArrowLeft') { current = Math.max(current - 1, 0); showSlide(current); }
  });
  showSlide(0);
</script>
</body>
</html>`;

  fs.writeFileSync(filePath, presentationHtml, 'utf-8');

  const stats = fs.statSync(filePath);
  const doc: GeneratedDocument = {
    id,
    filename,
    path: filePath,
    size: stats.size,
    format: 'pptx',
    downloadUrl: `/api/export/${id}/download`,
    createdAt: new Date()
  };

  documentsStore.set(id, doc);
  return doc;
}

async function generateHTML(request: DocumentRequest): Promise<GeneratedDocument> {
  ensureOutputDir();
  const id = nanoid();
  const filename = `${sanitizeFilename(request.title)}_${id}.html`;
  const filePath = path.join(GENERATED_DOCS_DIR, filename);

  const htmlContent = await marked(request.content);
  const fullHtml = buildHtmlShell(request.title, htmlContent, request.brandContext);

  fs.writeFileSync(filePath, fullHtml, 'utf-8');

  const stats = fs.statSync(filePath);
  const doc: GeneratedDocument = {
    id,
    filename,
    path: filePath,
    size: stats.size,
    format: 'html',
    downloadUrl: `/api/export/${id}/download`,
    createdAt: new Date()
  };

  documentsStore.set(id, doc);
  return doc;
}

async function generateCSV(request: DocumentRequest): Promise<GeneratedDocument> {
  return generateXLSX(request);
}

export async function generateDocument(request: DocumentRequest): Promise<GeneratedDocument> {
  switch (request.type) {
    case 'pdf':
      return generatePDF(request);
    case 'docx':
      return generateDOCX(request);
    case 'xlsx':
      return generateXLSX(request);
    case 'pptx':
      return generatePPTX(request);
    case 'csv':
      return generateCSV(request);
    case 'html':
      return generateHTML(request);
    default:
      throw new Error(`Unsupported document type: ${request.type}`);
  }
}

export function getDocument(id: string): GeneratedDocument | undefined {
  return documentsStore.get(id);
}

export function listDocuments(): GeneratedDocument[] {
  return Array.from(documentsStore.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function createShareLink(documentId: string, expiresInHours?: number): ShareLink | null {
  const doc = documentsStore.get(documentId);
  if (!doc) return null;

  const shareId = nanoid(12);
  const link: ShareLink = {
    shareId,
    documentId,
    createdAt: new Date(),
    expiresAt: expiresInHours ? new Date(Date.now() + expiresInHours * 60 * 60 * 1000) : undefined
  };

  shareLinks.set(shareId, link);
  return link;
}

export function getShareLink(shareId: string): ShareLink | null {
  const link = shareLinks.get(shareId);
  if (!link) return null;
  if (link.expiresAt && new Date() > link.expiresAt) {
    shareLinks.delete(shareId);
    return null;
  }
  return link;
}

export function getDocumentFilePath(id: string): string | null {
  const doc = documentsStore.get(id);
  if (!doc) return null;
  if (!fs.existsSync(doc.path)) return null;
  return doc.path;
}
