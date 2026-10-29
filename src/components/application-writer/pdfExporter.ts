import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

export async function exportToPdf(
  elementId: string,
  filename = 'Application.pdf',
  onProgress?: (status: string) => void
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('ডকুমেন্ট পাওয়া যায়নি।');
  }

  onProgress?.('PDF রেন্ডার প্রস্তুত হচ্ছে...');

  // Create an off-screen host container with exact standard A4 dimensions (794px at 96 DPI)
  // This guarantees that mobile screen size, responsive display:none or overflow never corrupts the export!
  const host = document.createElement('div');
  host.id = 'pdf-render-temp-host';
  host.style.position = 'fixed';
  host.style.left = '-10000px';
  host.style.top = '0';
  host.style.width = '794px';
  host.style.minHeight = '1123px';
  host.style.background = '#ffffff';
  host.style.color = '#0f172a';
  host.style.zIndex = '-99999';
  host.style.display = 'block';
  host.style.visibility = 'visible';
  host.style.opacity = '1';
  host.style.margin = '0';
  host.style.padding = '0';
  host.style.boxSizing = 'border-box';

  const clone = element.cloneNode(true) as HTMLElement;
  // Ensure the clone is visible and has clean A4 sheet styles
  clone.style.display = 'block';
  clone.style.visibility = 'visible';
  clone.style.width = '794px';
  clone.style.maxWidth = '794px';
  clone.style.margin = '0';
  clone.style.boxShadow = 'none';
  clone.style.border = 'none';

  // Strip all interactive buttons, toolbars, badge pills and non-printable elements
  clone.querySelectorAll('.print\\:hidden, [data-pdf-exclude="true"]').forEach((el) => {
    el.remove();
  });

  host.appendChild(clone);
  document.body.appendChild(host);

  try {
    // Wait for fonts & layout to calculate
    await new Promise((resolve) => setTimeout(resolve, 80));

    onProgress?.('হাই-রেজোলিউশন পেজ স্ক্যান হচ্ছে...');
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 794,
      windowWidth: 794,
    });

    onProgress?.('PDF পেজ তৈরি হচ্ছে...');
    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = 210;
    const pdfHeight = 297;
    const imgHeightInMm = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeightInMm;
    let position = 0;

    // First page
    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeightInMm, undefined, 'FAST');
    heightLeft -= pdfHeight;

    // Additional pages if needed (multi-page documents, threshold 5mm to avoid blank end page)
    let pageNum = 1;
    while (heightLeft > 5) {
      position = -(pdfHeight * pageNum);
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeightInMm, undefined, 'FAST');
      heightLeft -= pdfHeight;
      pageNum++;
    }

    onProgress?.('ডাউনলোড সম্পন্ন হচ্ছে...');
    const cleanName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

    // Multi-method download trigger for 100% browser & mobile webview compatibility
    try {
      pdf.save(cleanName);
    } catch {
      const blob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = cleanName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
    }
  } catch (error) {
    console.error('PDF export error:', error);
    // Ultimate fallback: open print dialog if canvas rendering fails
    onProgress?.('ব্রাউজার প্রিন্ট ডায়ালগ ওপেন হচ্ছে...');
    window.print();
    throw error;
  } finally {
    if (host.parentNode) {
      host.parentNode.removeChild(host);
    }
  }
}
