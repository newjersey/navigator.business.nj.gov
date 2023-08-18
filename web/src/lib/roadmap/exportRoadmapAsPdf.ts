import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface Props {
  componentIds: string[];
  prePdfProcessingCallback: () => void;
  postPdfProcessingCallback: () => void;
}
const splitElementIntoImages = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  element: any,
  pageWidthInPx: number,
  pageHeightInPx: number
): Promise<{ totalHeight: number; canvas: string }[]> => {
  const scaleFactor = pageWidthInPx / element.offsetWidth;
  const totalHeight = element.offsetHeight / scaleFactor;
  const pages = Math.ceil(totalHeight / pageHeightInPx);
  const carryOverPixels = 25;
  const images = [];

  const clone = element.cloneNode(true);
  clone.style.width = `${pageWidthInPx}px`;
  clone.style.transformOrigin = "top left";
  clone.style.position = "fixed";
  clone.style.top = "100%";
  clone.style.left = 0;
  document.body.append(clone);

  for (let i = 0; i < pages; i++) {
    const result = { totalHeight, canvas: "" };
    const canvas = await html2canvas(clone, {
      width: pageWidthInPx,
      height: Math.floor(Math.min(totalHeight - i * pageHeightInPx, pageHeightInPx)),
      y: i === 0 ? 0 : i * pageHeightInPx - carryOverPixels,
      windowWidth: Math.ceil(Math.max(element.offsetHeight, pageWidthInPx))
    });
    result.canvas = canvas.toDataURL("image/png");

    images.push(result);
  }
  clone.remove();
  return images;
};

export const exportComponentsAsPDF = async (props: Props): Promise<void> => {
  props.prePdfProcessingCallback();
  const pdf = new jsPDF({
    hotfixes: ["px_scaling"],
    orientation: "p",
    unit: "px",
    format: "a4"
  });

  const margin = 40;
  const pdfPageWidth = pdf.internal.pageSize.getWidth() - margin * 2;
  const pdfPageHeight = pdf.internal.pageSize.getHeight() - margin * 2;

  for (const [i, componentId] of props.componentIds.entries()) {
    const element = document.getElementById(componentId);
    if (!element) {
      console.error(`Component with id "${componentId}" not found.`);
      continue;
    }
    const images = await splitElementIntoImages(element, pdfPageWidth, pdfPageHeight);
    for (const [j, image] of images.entries()) {
      if (i !== 0 || j !== 0) {
        pdf.addPage();
      }
      pdf.addImage(
        image.canvas,
        "PNG",
        margin,
        margin,
        pdfPageWidth,
        Math.min(image.totalHeight - j * pdfPageHeight, pdfPageHeight),
        undefined,
        "FAST",
        0
      );
    }
  }

  pdf.save("roadmap.pdf");
  props.postPdfProcessingCallback();
};
