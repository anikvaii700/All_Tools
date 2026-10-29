import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

export async function exportToPdf(
  elementId: string,
  filename = 'Application.pdf',
  onProgress?: (status: string) => void
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('ডকুমেন্ট এলিমেন্ট পাওয়া যায়নি।');
  }

  onProgress?.('PDF রেন্ডার করা হচ্ছে...');

  // Use scale 2 for high definition crisp fonts and Bengali vowel/ligature rendering
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: element.scrollWidth,
  });

  onProgress?.('PDF পেজ তৈরি হচ্ছে...');

  const imgData = canvas.toDataURL('image/jpeg', 0.98);

  // A4 dimensions in mm: 210 x 297
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = 210;
  const pdfHeight = 297;
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  // Calculate proportional height in mm
  const imgHeightInMm = (canvasHeight * pdfWidth) / canvasWidth;

  let heightLeft = imgHeightInMm;
  let position = 0;

  // First page
  pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeightInMm, undefined, 'FAST');
  heightLeft -= pdfHeight;

  // Handle multi-page documents if content exceeds single A4 page
  let pageNum = 1;
  while (heightLeft > 0) {
    position = -(pdfHeight * pageNum);
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeightInMm, undefined, 'FAST');
    heightLeft -= pdfHeight;
    pageNum++;
  }

  onProgress?.('ডাউনলোড শুরু হচ্ছে...');
  pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}
