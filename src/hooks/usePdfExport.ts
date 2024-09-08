import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { RobotoFontBase64 } from '../constants';

const usePdfExport = () => {
  const exportToPDF = async (elementId: string, explanationText: string, formulaElementId: string) => {
    const doc = new jsPDF();

    // Завантаження шрифту Roboto-Bold
    doc.addFileToVFS('Roboto-Regular.ttf', RobotoFontBase64);
    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
    doc.setFont('Roboto', 'normal');

    // Додавання заголовку посередині сторінки
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFontSize(24);
    const titleText = 'Висновок про аналіз системи';
    const titleWidth = doc.getTextWidth(titleText);
    doc.text(titleText, (pageWidth - titleWidth) / 2, 20);

    // Захоплення і додавання формули
    const formulaElement = document.getElementById(formulaElementId);
    if (formulaElement) {
      const canvas = await html2canvas(formulaElement);
      const imgData = canvas.toDataURL('image/png');
      const imgHeight = (canvas.height * 200) / canvas.width; // Масштабування з урахуванням пропорцій
      doc.addImage(imgData, 'PNG', 0, 30, 200, imgHeight); // Розміщення по центру з полями
    }

    // Відступ після формули
    let yPosition = formulaElement ? 20 + (formulaElement.clientHeight * 150) / formulaElement.clientWidth + 20 : 20;

    // Додавання текстового висновку про стабільність системи
    doc.setFontSize(12);
    const splitExplanation = doc.splitTextToSize(explanationText, pageWidth - 30);
    const lineHeight = 6; // Більший інтервал для кращої читабельності

    splitExplanation.forEach((line: string) => {
      doc.text(line, 10, yPosition);
      yPosition += lineHeight;

      if (yPosition + lineHeight > doc.internal.pageSize.getHeight() - 30) {
        doc.addPage();
        yPosition = 20; // Нова сторінка
      }
    });

    // Додавання графіків у PDF
    const element = document.getElementById(elementId);
    if (element) {
      const chartContainers = element.querySelectorAll('.chart-container');

      chartContainers.forEach((chartContainer, index) => {
        const canvas = chartContainer.querySelector('canvas');
        if (canvas) {
          const canvasImg = canvas.toDataURL('image/png');

          if (yPosition + 100 > doc.internal.pageSize.getHeight() - 40) {
            doc.addPage();
            yPosition = 20;
          }

          doc.addImage(canvasImg, 'PNG', 15, yPosition, 180, 100); // Розміщення по центру
          yPosition += 110;

          if (index < chartContainers.length - 1) {
            yPosition += 15; // Додатковий відступ між графіками
          }
        }
      });
    }

    doc.save('stability-analysis.pdf');
  };

  return { exportToPDF };
};

export default usePdfExport;
