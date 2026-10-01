import QRCode from 'qrcode';
import { Machine, Part } from '../types';

/**
 * Computes the canonical mobile/direct catalog URL for a product
 */
export function getProductMobileUrl(product: Machine | Part, type: 'machinery' | 'part'): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://tmd.com.do';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  const cleanPath = pathname.endsWith('/') ? pathname : `${pathname}/`;

  if (type === 'machinery') {
    return `${origin}${cleanPath}#/machinery?id=${encodeURIComponent(product.id)}`;
  } else {
    return `${origin}${cleanPath}#/parts?id=${encodeURIComponent(product.id)}`;
  }
}

export interface ExportQrOptions {
  includeLabelHeader?: boolean;
  format?: 'png';
  size?: number;
}

/**
 * Generates and downloads a high-resolution QR label image for physical labeling in warehouse/yard
 */
export async function downloadProductQrCode(
  product: Machine | Part,
  type: 'machinery' | 'part',
  options: ExportQrOptions = {}
): Promise<string> {
  const isMachine = type === 'machinery';
  const machine = isMachine ? (product as Machine) : null;
  const part = !isMachine ? (product as Part) : null;

  const title = product.name;
  const brand = product.brand || 'TMD';
  const identifier = isMachine 
    ? (machine?.modelCode || machine?.id || 'EQUIPO')
    : (part?.partNumber || part?.id || 'REPUESTO');

  const mobileUrl = getProductMobileUrl(product, type);

  // Generate QR code data URL at high resolution (Error Correction 'H' for industrial/patio durability)
  const qrDataUrl = await QRCode.toDataURL(mobileUrl, {
    width: 600,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff'
    },
    errorCorrectionLevel: 'H'
  });

  // Create an industrial composite canvas for warehouse label printing
  const canvasWidth = 720;
  const canvasHeight = 920;
  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    // Fallback: direct download of the plain QR code
    triggerDownload(qrDataUrl, `QR-${brand}-${identifier}-TMD.png`);
    return qrDataUrl;
  }

  // 1. White Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // 2. Yellow/Amber Hazard Header Bar
  ctx.fillStyle = '#f59e0b'; // Amber-500
  ctx.fillRect(0, 0, canvasWidth, 18);

  // Top header box
  ctx.fillStyle = '#18181b'; // Zinc-900
  ctx.fillRect(0, 18, canvasWidth, 90);

  // Header Title
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 24px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('TMD DOMINICANA', canvasWidth / 2, 54);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px monospace';
  ctx.fillText('CONTROL DE PATIO & RÓTULO DE ALMACÉN • KM 22', canvasWidth / 2, 80);

  // Subtitle / Facility
  ctx.fillStyle = '#a1a1aa';
  ctx.font = '10px monospace';
  ctx.fillText('AUTOP. DUARTE KM 22, PEDRO BRAND, SANTO DOMINGO OESTE', canvasWidth / 2, 98);

  // 3. Product Identifier Banner
  ctx.fillStyle = '#f4f4f5';
  ctx.fillRect(30, 125, canvasWidth - 60, 80);
  ctx.strokeStyle = '#e4e4e7';
  ctx.lineWidth = 2;
  ctx.strokeRect(30, 125, canvasWidth - 60, 80);

  // Brand tag
  ctx.fillStyle = '#09090b';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(brand.toUpperCase(), 48, 155);

  // Code (Model Code or Part Number)
  ctx.fillStyle = '#b45309'; // Rich Amber
  ctx.font = 'bold 22px monospace';
  ctx.fillText(
    `${isMachine ? 'MOD:' : 'P/N:'} ${identifier}`,
    48,
    188
  );

  // Category tag on right
  ctx.textAlign = 'right';
  ctx.fillStyle = '#52525b';
  ctx.font = 'bold 13px monospace';
  const categoryText = isMachine ? (machine?.category || 'MAQUINARIA') : (part?.category || 'REPUESTO OEM');
  ctx.fillText(categoryText.toUpperCase(), canvasWidth - 48, 155);

  // 4. Draw QR Code in Center
  const qrImage = new Image();
  await new Promise<void>((resolve, reject) => {
    qrImage.onload = () => resolve();
    qrImage.onerror = reject;
    qrImage.src = qrDataUrl;
  });

  const qrSize = 460;
  const qrX = (canvasWidth - qrSize) / 2;
  const qrY = 220;

  // Outer border around QR
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.strokeRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);

  ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

  // 5. Product Name Text below QR
  ctx.textAlign = 'center';
  ctx.fillStyle = '#09090b';
  ctx.font = 'bold 18px sans-serif';

  // Clip long titles
  const maxTitleLength = 48;
  const displayTitle = title.length > maxTitleLength ? `${title.slice(0, maxTitleLength)}...` : title;
  ctx.fillText(displayTitle.toUpperCase(), canvasWidth / 2, 725);

  // 6. Footer Information (Scannable instructions & serial timestamp)
  ctx.fillStyle = '#71717a';
  ctx.font = '12px monospace';
  ctx.fillText('ESCANEAR CON CÁMARA O COLECTOR DE DATOS TMD', canvasWidth / 2, 755);

  const dateStr = new Date().toLocaleDateString('es-DO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  ctx.font = '10px monospace';
  ctx.fillStyle = '#a1a1aa';
  ctx.fillText(`ETIQUETA GENERADA: ${dateStr} • ID: ${product.id}`, canvasWidth / 2, 775);

  // 7. Bottom Hazard Stripes
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(0, canvasHeight - 20, canvasWidth, 20);

  // Generate composite PNG
  const finalDataUrl = canvas.toDataURL('image/png');
  const safeBrand = (brand || 'TMD').replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeId = (identifier || product.id).replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `ROTULO-QR-${safeBrand}-${safeId}-TMD.png`;

  triggerDownload(finalDataUrl, fileName);
  return finalDataUrl;
}
function triggerDownload(dataUrl: string, filename: string) {
  if (typeof document === 'undefined') return;
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates an offline Data URL for any QR string without relying on external APIs
 */
export async function generateQrDataUrl(text: string, size: number = 240): Promise<string> {
  return QRCode.toDataURL(text, {
    width: size,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#ffffff'
    }
  });
}
