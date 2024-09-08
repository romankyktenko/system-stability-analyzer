import { evaluate, multiply, subtract, divide, complex, Complex, add, sqrt, pow } from 'mathjs';

interface NyquistDataPoint {
  real: number;
  imag: number;
}

interface BodeData {
  frequencies: number[];
  magnitude: number[];
  phase: number[];
}

interface StabilityAnalysisResult {
  stability: string;
  explanation: JSX.Element;
  explanationText: string;
  nyquist: NyquistDataPoint[];
  bode: BodeData;
  roots: Complex[];
}

const useStabilityAnalysis = () => {
  const analyseStability = (denCoeffs: number[]): { stability: string, explanation: JSX.Element, explanationText: string } => {
    const routhArray = createRouthArray(denCoeffs);
    const isStable = routhArray.every(row => row.every(el => el > 0));
    const stability = isStable ? 'Стабільна' : 'Нестабільна';

    const explanation = (
      <div>
        <strong>Критерій Раута-Гурвіца:</strong> Система визначена як <strong>{stability}</strong>.
        <br />
        {isStable
          ? 'Всі елементи масиву Раута мають однаковий знак, що означає відсутність полюсів у правій частині комплексної площини, що підтверджує стабільність системи.'
          : 'У масиві Раута є зміна знаку, що вказує на наявність полюсів у правій частині комплексної площини, що означає нестабільність системи.'}
        <br />
        Цей метод дозволяє на основі характеристичного рівняння визначити, скільки коренів знаходяться в правій частині комплексної площини.
      </div>
    );

    const explanationText = `
Критерій Раута-Гурвіца:
Система визначена як ${stability}. ${isStable
      ? 'Всі елементи масиву Раута мають однаковий знак, що означає відсутність полюсів у правій частині комплексної площини, що підтверджує стабільність системи.'
      : 'У масиві Раута є зміна знаку, що вказує на наявність полюсів у правій частині комплексної площини.'}`;

    return { stability, explanation, explanationText };
  };

  const createRouthArray = (coeffs: number[]): number[][] => {
    let routh: number[][] = [coeffs.filter((_, i) => i % 2 === 0), coeffs.filter((_, i) => i % 2 !== 0)];
    while (routh[routh.length - 1].length > 1) {
      const newRow: number[] = [];
      for (let i = 0; i < routh[routh.length - 1].length - 1; i++) {
        const numerator = subtract(
          multiply(routh[routh.length - 2][0], routh[routh.length - 1][i + 1]),
          multiply(routh[routh.length - 1][i], routh[routh.length - 2][i + 1])
        );
        const denominator = routh[routh.length - 2][0];
        newRow.push(divide(numerator, denominator) as number);
      }
      routh.push(newRow);
    }
    return routh;
  };

  const findRoots = (coeffs: number[]): Complex[] => {
    const roots: Complex[] = [];
    const degree = coeffs.length - 1;

    if (degree === 2) {
      const a = coeffs[0];
      const b = coeffs[1];
      const c = coeffs[2];
      const discriminant = subtract(pow(b, 2), multiply(4, multiply(a, c)));
      const root1 = divide(subtract(-b, sqrt(discriminant as Complex)), multiply(2, a));
      const root2 = divide(add(-b, sqrt(discriminant as Complex)), multiply(2, a));
      roots.push(root1 as Complex, root2 as Complex);
    } else if (degree === 1) {
      const a = coeffs[0];
      const b = coeffs[1];
      const root = divide(-b, a);
      // @ts-ignore
      roots.push(root);
    }

    return roots.filter(root => root !== undefined && root.re !== undefined && root.im !== undefined);
  };

  const nyquistCriterion = (numCoeffs: number[], denCoeffs: number[]): { data: NyquistDataPoint[], explanation: JSX.Element, explanationText: string } => {
    const data: NyquistDataPoint[] = [];
    const points = Array.from({ length: 100 }, (_, i) => i * (2 * Math.PI / 100));

    let clockwiseEncirclements = 0;

    for (const point of points) {
      const omega = multiply(point, complex(0, 1));
      const numValue = evaluatePolynomial(numCoeffs, omega as Complex);
      const denValue = evaluatePolynomial(denCoeffs, omega as Complex);

      const realPart = divide(numValue.re * denValue.re + numValue.im * denValue.im,
        denValue.re * denValue.re + denValue.im * denValue.im);
      const imagPart = divide(numValue.im * denValue.re - numValue.re * denValue.im,
        denValue.re * denValue.re + denValue.im * denValue.im);

      data.push({ real: realPart as number, imag: imagPart as number });

      if (realPart < 0) {
        clockwiseEncirclements++;
      }
    }

    const explanation = (
      <div>
        <strong>Критерій Найквіста:</strong> Система {clockwiseEncirclements === 0 ? 'стабільна' : 'нестабільна'}.
        <br />
        {clockwiseEncirclements === 0
          ? 'Відсутні обходи точки -1 за годинниковою стрілкою, що свідчить про стабільність системи.'
          : `Є ${clockwiseEncirclements} обходів точки -1 за годинниковою стрілкою, що свідчить про нестабільність системи.`}
        <br />
        Цей аналіз виконується шляхом відстеження поведінки передавальної функції у комплексній площині. Важливою є точка -1, оскільки вона впливає на стабільність замкненої системи.
      </div>
    );

    const explanationText = `
Критерій Найквіста:
${clockwiseEncirclements === 0
      ? 'Система стабільна, оскільки відсутні обходи точки -1 за годинниковою стрілкою.'
      : `Система нестабільна, оскільки є ${clockwiseEncirclements} обходів точки -1 за годинниковою стрілкою.`}`;

    return { data, explanation, explanationText };
  };

  const bodePlot = (numCoeffs: number[], denCoeffs: number[]): { data: BodeData, explanation: JSX.Element, explanationText: string } => {
    const frequencies: number[] = Array.from({ length: 100 }, (_, i) => Math.pow(10, i / 20 - 2));
    const magnitude: number[] = frequencies.map(f => {
      const omega = multiply(2 * Math.PI * f, complex(0, 1));
      const numValue = evaluatePolynomial(numCoeffs, omega as Complex);
      const denValue = evaluatePolynomial(denCoeffs, omega as Complex);
      return 20 * Math.log10(Math.sqrt(numValue.re ** 2 + numValue.im ** 2) / Math.sqrt(denValue.re ** 2 + denValue.im ** 2));
    });
    const phase: number[] = frequencies.map(f => {
      const omega = multiply(2 * Math.PI * f, complex(0, 1));
      const numValue = evaluatePolynomial(numCoeffs, omega as Complex);
      const denValue = evaluatePolynomial(denCoeffs, omega as Complex);
      return Math.atan2(numValue.im, numValue.re) - Math.atan2(denValue.im, denValue.re);
    });

    const phaseMargin = phase[phase.length - 1];
    const explanation = (
      <div>
        <strong>Критерій Боде:</strong> Система {phaseMargin < 0 ? 'нестабільна' : 'стабільна'}.
        <br />
        {phaseMargin < 0
          ? 'Фазовий запас менший за 0, що означає можливу нестабільність системи.'
          : 'Фазовий запас більший за 0, що вказує на достатню стабільність системи при збуреннях.'}
        <br />
        Аналіз Боде використовується для оцінки частотної характеристики системи і допомагає визначити, чи достатньо системі запасу для стабільної роботи.
      </div>
    );

    const explanationText = `
Критерій Боде:
${phaseMargin < 0
      ? 'Система нестабільна, оскільки фазовий запас менший за 0.'
      : 'Система стабільна, оскільки фазовий запас більший за 0.'}`;

    return { data: { frequencies, magnitude, phase }, explanation, explanationText };
  };

  const evaluatePolynomial = (coeffs: number[], x: Complex): Complex => {
    return coeffs.reduce((acc: Complex, cur: number, idx: number) =>
        add(acc, multiply(cur, evaluate('x^y', { x, y: coeffs.length - 1 - idx }))) as Complex,
      complex(0, 0)
    );
  };

  const fullAnalysis = (numCoeffs: number[], denCoeffs: number[]): StabilityAnalysisResult => {
    const stabilityResult = analyseStability(denCoeffs);
    const nyquistResult = nyquistCriterion(numCoeffs, denCoeffs);
    const bodeResult = bodePlot(numCoeffs, denCoeffs);
    const roots = findRoots(denCoeffs);

    const fullExplanation = (
      <div>
        {stabilityResult.explanation}
        <br />
        {nyquistResult.explanation}
        <br />
        {bodeResult.explanation}
        <br />

        {roots.length > 0 ? (
          <>
            <strong>Аналіз коренів:</strong> Корені характеристичного рівняння:
            {roots.map((root, index) => (
              <div key={index}>
                Корінь {index + 1}: {root.re?.toFixed(2)} + {root.im?.toFixed(2)}i
              </div>
            ))}
          </>
        ) : ''}
        <br />
        {roots.length === 0 ? '' : roots.some(root => root.re > 0) ? (
          <span>Система нестабільна, оскільки є корені з додатною дійсною частиною.</span>
        ) : (
          <span>Система стабільна, оскільки всі корені мають від'ємну дійсну частину.</span>
        )}
      </div>
    );

    let fullExplanationText = `${stabilityResult.explanationText}\n${nyquistResult.explanationText}\n${bodeResult.explanationText}`;

    if (roots.length) {
      fullExplanationText = `${fullExplanationText}\n
Аналіз коренів:
Корені характеристичного рівняння:\n${roots.length > 0
        ? roots.map(
          (root, index) => `Корінь ${index + 1}: ${root.re?.toFixed(2)} + ${root.im?.toFixed(2)}i\n`
        ).join('')
        : 'Неможливо обчислити корені для полінома цього ступеня.'}\n${
        roots.length === 0
          ? 'Корені не знайдено. Не вдалося провести аналіз на основі коренів.'
          : roots.some(root => root.re > 0)
            ? 'Система нестабільна, оскільки є корені з додатною дійсною частиною.'
            : 'Система стабільна, оскільки всі корені мають від\'ємну дійсну частину.'
      }`
    }

    return {
      stability: stabilityResult.stability,
      explanation: fullExplanation,
      explanationText: fullExplanationText,
      nyquist: nyquistResult.data,
      bode: bodeResult.data,
      roots,
    };
  };

  return {
    fullAnalysis,
  };
};

export default useStabilityAnalysis;
