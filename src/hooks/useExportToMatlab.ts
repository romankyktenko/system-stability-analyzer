import { useCallback } from 'react';

interface SelectedAnalyses {
  step: boolean;
  impulse: boolean;
  pzmap: boolean;
}

export const useExportToMatlab = () => {
  const exportToMatlab = useCallback(
    (numerator: number[], denominator: number[], selectedAnalyses: SelectedAnalyses) => {
      let matlabScript = `
% Numerator and Denominator of the Transfer Function
num = [${numerator.join(', ')}];
den = [${denominator.join(', ')}];

% Create Transfer Function
sys = tf(num, den);
`;

      if (selectedAnalyses.step) {
        matlabScript += `
% Step Response
figure;
step(sys);
`;
      }

      if (selectedAnalyses.impulse) {
        matlabScript += `
% Impulse Response
figure;
impulse(sys);
`;
      }

      if (selectedAnalyses.pzmap) {
        matlabScript += `
% Poles and Zeros Map
figure;
pzmap(sys);
`;
      }

      const blob = new Blob([matlabScript], { type: 'text/plain' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'transfer_function_analysis.m';
      link.click();
    },
    []
  );

  return { exportToMatlab };
};
