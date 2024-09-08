import { useCallback } from 'react';

interface SelectedAnalyses {
  bode: boolean;
  nyquist: boolean;
  step: boolean;
  impulse: boolean;
}

export const useExportToMatlab = () => {
  const exportToMatlab = useCallback((numerator: number[], denominator: number[], selectedAnalyses: SelectedAnalyses) => {
    let matlabScript = `
% MATLAB Script for Transfer Function Analysis

% Numerator and Denominator of the Transfer Function
num = [${numerator.join(', ')}];
den = [${denominator.join(', ')}];

% Create Transfer Function
sys = tf(num, den);
`;

    if (selectedAnalyses.bode) {
      matlabScript += `
% Bode Plot
figure;
bode(sys);
`;
    }

    if (selectedAnalyses.nyquist) {
      matlabScript += `
% Nyquist Plot
figure;
nyquist(sys);
`;
    }

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

    const blob = new Blob([matlabScript], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'transfer_function_analysis.m';
    link.click();
  }, []);

  return { exportToMatlab };
};
