import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { RobotoFontBase64 } from '../constants';

const usePdfExport = () => {
  const exportToPDF = async (
    elementId: string,
    summaryText: string,
    formulaElementId: string,
    analysisResults: any,
    selectedAnalyses: {
      step: boolean;
      impulse: boolean;
      pzmap: boolean;
      nonMinimumPhase: boolean;
    }
  ) => {
    const doc = new jsPDF();

    // Завантаження шрифту Roboto-Regular
    doc.addFileToVFS('Roboto-Regular.ttf', RobotoFontBase64);
    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
    doc.setFont('Roboto', 'normal');

    // Додавання заголовку посередині сторінки
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFontSize(18);
    const titleText = 'Результати аналізу системи';
    const titleWidth = doc.getTextWidth(titleText);
    doc.text(titleText, (pageWidth - titleWidth) / 2, 20);

    // Додавання формули передавальної функції
    const formulaElement = document.getElementById(formulaElementId);
    if (formulaElement) {
      const canvas = await html2canvas(formulaElement);
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - 40;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      doc.addImage(imgData, 'PNG', 20, 30, imgWidth, imgHeight);
    }

    // Початкова позиція Y після формули
    let yPosition = formulaElement
      ? 20 + (formulaElement.clientHeight * (pageWidth - 40)) / formulaElement.clientWidth + 20
      : 40;

    doc.setFontSize(12);
    doc.setTextColor(50);
    const splitSummary = doc.splitTextToSize(summaryText, pageWidth - 40);
    doc.text(splitSummary, 20, yPosition);
    yPosition += splitSummary.length * 6 + 10;

    // Додавання аналізу не мінімально фазової системи (якщо обрано)
    if (selectedAnalyses.nonMinimumPhase) {
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text('Аналіз не мінімально фазової системи', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(12);
      doc.setTextColor(50);
      const phaseText = analysisResults.isNonMinimumPhase
        ? 'Система є не мінімально фазовою.'
        : 'Система є мінімально фазовою.';
      const splitPhaseText = doc.splitTextToSize(phaseText, pageWidth - 40);
      doc.text(splitPhaseText, 20, yPosition);
      yPosition += splitPhaseText.length * 6 + 10;
    }

    // Додавання полюсів та нулів (якщо обрано)
    if (selectedAnalyses.pzmap) {
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text('Полюси та нулі системи', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(12);
      doc.setTextColor(50);

      // Полюси
      doc.text('Полюси:', 20, yPosition);
      yPosition += 8;
      if (analysisResults.pzMap.poles.length > 0) {
        analysisResults.pzMap.poles.forEach((pole: any) => {
          doc.text(`- ${formatComplexNumber(pole)}`, 25, yPosition);
          yPosition += 6;
          if (yPosition > doc.internal.pageSize.getHeight() - 20) {
            doc.addPage();
            yPosition = 20;
          }
        });
      } else {
        doc.text('Полюси не знайдені', 25, yPosition);
        yPosition += 6;
      }
      yPosition += 4;

      // Нулі
      doc.text('Нулі:', 20, yPosition);
      yPosition += 8;
      if (analysisResults.pzMap.zeros.length > 0) {
        analysisResults.pzMap.zeros.forEach((zero: any) => {
          doc.text(`- ${formatComplexNumber(zero)}`, 25, yPosition);
          yPosition += 6;
          if (yPosition > doc.internal.pageSize.getHeight() - 20) {
            doc.addPage();
            yPosition = 20;
          }
        });
      } else {
        doc.text('Нулі не знайдені', 25, yPosition);
        yPosition += 6;
      }
      yPosition += 10;
    }

    // Додавання графіків з підписами
    const element = document.getElementById(elementId);
    if (element) {
      const chartContainers = element.querySelectorAll('.chart-container');

      // Формуємо масив підписів до графіків
      const captions = [];
      if (selectedAnalyses.pzmap) {
        captions.push('Розташування полюсів і нулів на комплексній площині');
      }
      if (selectedAnalyses.step) {
        captions.push('Перехідна характеристика');
      }
      if (selectedAnalyses.impulse) {
        captions.push('Імпульсна характеристика');
      }

      for (let i = 0; i < chartContainers.length; i++) {
        const chartContainer = chartContainers[i] as HTMLElement;
        const canvas = chartContainer.querySelector('canvas');
        if (canvas) {
          const canvasImg = canvas.toDataURL('image/png');
          const imgWidth = pageWidth - 40;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          if (yPosition + imgHeight + 30 > doc.internal.pageSize.getHeight() - 20) {
            doc.addPage();
            yPosition = 20;
          }

          doc.addImage(canvasImg, 'PNG', 20, yPosition, imgWidth, imgHeight);
          yPosition += imgHeight + 5;

          // Додавання підпису до графіка
          doc.setFontSize(12);
          doc.setTextColor(50);
          const caption = captions[i];
          const captionWidth = doc.getTextWidth(caption);
          doc.text(caption, (pageWidth - captionWidth) / 2, yPosition);
          yPosition += 15;
        }
      }
    }

    // Додавання секції "Висновок"
    if (yPosition + 30 > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Висновок', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setTextColor(50);

    const stabilityText = analysisResults.stability === 'Стійка' ? 'стійку' : 'нестійку';
    const polesPosition = analysisResults.pzMap.poles.length === 0
      ? 'не знайдені'
      : analysisResults.pzMap.poles.every((pole: any) => pole.re < 0)
        ? 'в лівій частині комплексної площини'
        : 'в правій частині комплексної площини';
    const phaseText = analysisResults.isNonMinimumPhase
      ? 'Однак система є не мінімально фазовою, що може впливати на її динамічну поведінку.'
      : 'Система також є мінімально фазовою, що сприяє покращеній динамічній поведінці.';

    const conclusionText = `Система демонструє ${stabilityText} поведінку на основі аналізу полюсів і нулів. Полюси розташовані ${polesPosition}, що вказує на її ${stabilityText}. ${phaseText}`;

    const splitConclusion = doc.splitTextToSize(conclusionText, pageWidth - 40);
    doc.text(splitConclusion, 20, yPosition);
    yPosition += splitConclusion.length * 6 + 10;

    // Зберігаємо PDF-файл
    doc.save('stability-analysis.pdf');
  };

  // Функція форматування комплексних чисел
  const formatComplexNumber = (num: { re: number; im: number }) => {
    const rePart = num.re.toFixed(2);
    const imPart = Math.abs(num.im).toFixed(2);
    if (num.im === 0) return `${rePart}`;
    if (num.im > 0) return `${rePart} + ${imPart}i`;
    return `${rePart} - ${imPart}i`;
  };

  return { exportToPDF };
};

export default usePdfExport;
