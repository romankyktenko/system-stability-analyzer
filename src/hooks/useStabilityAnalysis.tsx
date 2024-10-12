import { Complex, complex } from 'mathjs';
import numeric from 'numeric';

interface StepResponseData {
  time: number[];
  response: number[];
}

interface ImpulseResponseData {
  time: number[];
  response: number[];
}

interface PZMapData {
  poles: Complex[];
  zeros: Complex[];
}

interface StabilityAnalysisResult {
  stability: string;
  explanation: JSX.Element;
  explanationText: string;
  stepResponse: StepResponseData;
  impulseResponse: ImpulseResponseData;
  pzMap: PZMapData;
  isNonMinimumPhase: boolean;
  summaryText: string;
}

const useStabilityAnalysis = () => {
  const fullAnalysis = (
    numCoeffs: number[],
    denCoeffs: number[],
  ): StabilityAnalysisResult => {
    // Перевірка на порожній або нульовий чисельник
    const nonZeroNumCoeffs = numCoeffs.some(coef => coef !== 0);
    if (!nonZeroNumCoeffs) {
      throw new Error('Чисельник не може бути порожнім або складатися лише з нулів.');
    }

    // Перевірка на порожній або нульовий знаменник
    const nonZeroDenCoeffs = denCoeffs.some(coef => coef !== 0);
    if (!nonZeroDenCoeffs) {
      throw new Error('Знаменник не може бути порожнім або складатися лише з нулів.');
    }

    const zeros = findRoots(numCoeffs);
    const poles = findRoots(denCoeffs);

    const pzMap = {
      zeros,
      poles,
    };

    const isStable = poles.every(pole => pole.re < 0);

    const stability = isStable ? 'Стійка' : 'Нестійка';

    const isMinimumPhase = isStable && zeros.every(zero => zero.re < 0);

    const isNonMinimumPhase = !isMinimumPhase;

    const summaryText = `Система визначена як ${stability.toLowerCase()}. Аналіз полюсів і нулів вказує на те, що система є ${
      isNonMinimumPhase ? 'не мінімально фазовою' : 'мінімально фазовою'
    }.`;


    const explanation = (
      <div>
        Система визначена як <strong>{stability.toLowerCase()}</strong>.
      </div>
    );

    const explanationText = `Аналіз системи: система визначена як ${stability}. ${
      isNonMinimumPhase ? 'Система є не мінімально фазовою.' : 'Система є мінімально фазовою.'
    }`;

    const stepResponse = calculateStepResponse(numCoeffs, denCoeffs);
    const impulseResponse = calculateImpulseResponse(numCoeffs, denCoeffs);

    return {
      stability,
      explanation,
      explanationText,
      stepResponse,
      impulseResponse,
      pzMap,
      isNonMinimumPhase,
      summaryText,
    };
  };

  const findRoots = (coeffs: number[]): Complex[] => {
    // Видаляємо провідні нулі
    while (coeffs.length > 0 && coeffs[0] === 0) {
      coeffs.shift();
    }

    // Якщо після видалення нулів масив порожній, повертаємо порожній масив коренів
    if (coeffs.length === 0) {
      return [];
    }

    // Якщо перший коефіцієнт дорівнює нулю після очищення, кидаємо помилку
    if (coeffs[0] === 0) {
      throw new Error('Перший коефіцієнт не може бути нулем.');
    }

    const n = coeffs.length - 1;
    if (n <= 0) {
      return [];
    }

    if (n === 1) {
      // Лінійне рівняння: a*x + b = 0
      const [a, b] = coeffs;
      const root = -b / a;
      return [complex(root, 0)];
    } else if (n === 2) {
      // Квадратне рівняння: a*x^2 + b*x + c = 0
      const [a, b, c] = coeffs;
      const discriminant = b * b - 4 * a * c;
      if (discriminant >= 0) {
        const sqrtD = Math.sqrt(discriminant);
        const root1 = (-b + sqrtD) / (2 * a);
        const root2 = (-b - sqrtD) / (2 * a);
        return [complex(root1, 0), complex(root2, 0)];
      } else {
        const sqrtD = Math.sqrt(-discriminant);
        const realPart = -b / (2 * a);
        const imagPart = sqrtD / (2 * a);
        return [complex(realPart, imagPart), complex(realPart, -imagPart)];
      }
    } else {
      // Поліноми ступеня 3 і вище
      // Нормалізуємо та видаляємо перший коефіцієнт
      const a = coeffs.slice(1).map(c => c / coeffs[0]);

      // Створюємо компаньйонну матрицю
      const companion = numeric.rep([n, n], 0);
      for (let i = 0; i < n; i++) {
        if (i < n - 1) {
          companion[i + 1][i] = 1;
        }
        companion[0][i] = -a[i];
      }
      const eigenvalues = numeric.eig(companion).lambda;
      const roots = [];
      for (let i = 0; i < eigenvalues.x.length; i++) {
        roots.push(complex(eigenvalues.x[i], eigenvalues.y[i]));
      }
      return roots;
    }
  };

  // Функція для створення станового представлення системи
  const createStateSpaceModel = (numCoeffs: number[], denCoeffs: number[]) => {
    const n = denCoeffs.length - 1;
    const m = numCoeffs.length - 1;

    // Перевірка на нульовий перший коефіцієнт
    if (denCoeffs[0] === 0) {
      throw new Error('Перший коефіцієнт знаменника не може бути нулем.');
    }

    // Нормалізуємо коефіцієнти
    const a = denCoeffs.map(coeff => coeff / denCoeffs[0]);
    const b = numCoeffs.map(coeff => coeff / denCoeffs[0]);

    // Матриця A
    const A = numeric.rep([n, n], 0);
    for (let i = 0; i < n - 1; i++) {
      A[i + 1][i] = 1;
    }
    for (let i = 0; i < n; i++) {
      A[0][i] = -a[i + 1];
    }

    // Вектор B
    const B = numeric.rep([n, 1], 0);
    B[0][0] = 1;

    // Вектор C
    const C = numeric.rep([1, n], 0);
    for (let i = 0; i < m + 1; i++) {
      C[0][i] = b[i];
    }

    // Якщо ступінь чисельника менше ступеня знаменника
    for (let i = m + 1; i < n; i++) {
      C[0][i] = 0;
    }

    // Скаляр D
    const D = m < n ? 0 : b[n];

    return { A, B, C, D };
  };


  // Функція для симуляції реакції системи
  const simulateSystemResponse = (
    A: number[][],
    B: number[][],
    C: number[][],
    D: number,
    u: number[],
    time: number[]
  ) => {
    const dt = time[1] - time[0];
    const n = A.length;
    let x = numeric.rep([n, 1], 0);
    const y = [];

    for (let i = 0; i < u.length; i++) {
      const u_i = u[i];

      // Метод Рунге-Кутта 4-го порядку
      const k1 = numeric.add(numeric.dot(A, x), numeric.mul(B, u_i));
      const x_temp1 = numeric.add(x, numeric.mul(k1, dt / 2));

      const k2 = numeric.add(numeric.dot(A, x_temp1), numeric.mul(B, u_i));
      const x_temp2 = numeric.add(x, numeric.mul(k2, dt / 2));

      const k3 = numeric.add(numeric.dot(A, x_temp2), numeric.mul(B, u_i));
      const x_temp3 = numeric.add(x, numeric.mul(k3, dt));

      const k4 = numeric.add(numeric.dot(A, x_temp3), numeric.mul(B, u_i));

      const dx = numeric.mul(
        numeric.add(
          k1,
          numeric.mul(2, k2),
          numeric.mul(2, k3),
          k4
        ),
        1 / 6
      );

      x = numeric.add(x, numeric.mul(dx, dt));

      // Обчислюємо вихідний сигнал
      const y_i = numeric.dot(C, x)[0][0] + D * u_i;
      y.push(y_i);
    }

    return y;
  };


  const calculateStepResponse = (numCoeffs: number[], denCoeffs: number[]): StepResponseData => {
    const tFinal = 10;
    const dt = 0.01;
    const time = numeric.linspace(0, tFinal, tFinal / dt + 1);

    // Створюємо модель станів
    const { A, B, C, D } = createStateSpaceModel(numCoeffs, denCoeffs);

    // Вхідний сигнал - одиничний стрибок
    const u = time.map(() => 1);

    // Обчислюємо реакцію системи
    const response = simulateSystemResponse(A, B, C, D, u, time);

    return { time, response };
  };

  const calculateImpulseResponse = (numCoeffs: number[], denCoeffs: number[]): ImpulseResponseData => {
    const tFinal = 10;
    const dt = 0.01;
    const time = numeric.linspace(0, tFinal, tFinal / dt + 1);

    // Створюємо модель станів
    const { A, B, C, D } = createStateSpaceModel(numCoeffs, denCoeffs);

    // Вхідний сигнал - дельта-імпульс (апроксимуємо його вузьким імпульсом)
    const u = time.map((t: number) => (t === 0 ? 1 / dt : 0));

    // Обчислюємо реакцію системи
    const response = simulateSystemResponse(A, B, C, D, u, time);

    return { time, response };
  };

  return {
    fullAnalysis,
  };
};

export default useStabilityAnalysis;
