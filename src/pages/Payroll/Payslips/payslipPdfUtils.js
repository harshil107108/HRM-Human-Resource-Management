import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * Converts a numeric amount to Indian English Currency Words.
 * e.g., 51500 -> "Fifty-One Thousand Five Hundred Rupees Only"
 */
export function amountToWords(num) {
  const n = Math.floor(Math.abs(Number(num) || 0));
  if (n === 0) return "Zero Rupees Only";

  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
  ];
  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
  ];

  function convertTwoDigits(val) {
    if (val < 20) return ones[val];
    const unit = val % 10;
    return tens[Math.floor(val / 10)] + (unit ? `-${ones[unit]}` : "");
  }

  function convertThreeDigits(val) {
    const hundred = Math.floor(val / 100);
    const rest = val % 100;
    let res = "";
    if (hundred) {
      res += `${ones[hundred]} Hundred`;
      if (rest) res += " and ";
    }
    if (rest) {
      res += convertTwoDigits(rest);
    }
    return res;
  }

  // Indian Numbering System: Crores (7+), Lakhs (5-6), Thousands (3-4), Hundreds (0-2)
  let crore = Math.floor(n / 10000000);
  let remainder = n % 10000000;

  let lakh = Math.floor(remainder / 100000);
  remainder = remainder % 100000;

  let thousand = Math.floor(remainder / 1000);
  remainder = remainder % 1000;

  let hundredPart = remainder;

  const parts = [];

  if (crore) parts.push(`${convertTwoDigits(crore)} Crore`);
  if (lakh) parts.push(`${convertTwoDigits(lakh)} Lakh`);
  if (thousand) parts.push(`${convertTwoDigits(thousand)} Thousand`);
  if (hundredPart) parts.push(convertThreeDigits(hundredPart));

  return `${parts.join(" ")} Rupees Only`;
}

/**
 * Exports a DOM element as a high-resolution, vector-accurate A4 PDF.
 */
export async function exportPayslipToPdf(elementId, filename = "Payslip.pdf") {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element #${elementId} not found for PDF export.`);
    return false;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2.5, // Ultra-high resolution crisp text
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = 210; // A4 standard width (mm)
    const pageHeight = 297; // A4 standard height (mm)
    const margin = 10;
    const printableWidth = pageWidth - margin * 2;
    const calculatedHeight = (canvas.height * printableWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", margin, margin, printableWidth, Math.min(calculatedHeight, pageHeight - margin * 2));
    pdf.save(filename);
    return true;
  } catch (error) {
    console.error("PDF generation failed:", error);
    // Fallback: trigger print
    window.print();
    return false;
  }
}

/**
 * Triggers clean native print using an isolated iframe to prevent popup blocks.
 */
export function printPayslipDirect(elementId) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const printIframe = document.createElement("iframe");
  printIframe.style.position = "fixed";
  printIframe.style.right = "0";
  printIframe.style.bottom = "0";
  printIframe.style.width = "0";
  printIframe.style.height = "0";
  printIframe.style.border = "0";

  document.body.appendChild(printIframe);

  const doc = printIframe.contentWindow.document;
  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Payslip</title>
        <style>
          @page { size: A4 portrait; margin: 12mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background: #fff; color: #1e293b; }
          * { box-sizing: border-box; }
        </style>
      </head>
      <body>
        ${element.outerHTML}
      </body>
    </html>
  `);
  doc.close();

  printIframe.contentWindow.focus();
  setTimeout(() => {
    printIframe.contentWindow.print();
    setTimeout(() => {
      document.body.removeChild(printIframe);
    }, 500);
  }, 300);
}
