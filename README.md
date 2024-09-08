# System Stability Analyzer

System Stability Analyzer is a web application designed for control systems analysis using transfer functions. The app performs stability analysis using various criteria (Routh-Hurwitz, Nyquist, Bode), visualizes the results with graphs, provides detailed textual explanations, and supports exporting the analysis in PDF and MATLAB formats.

## Features

- **Stability Analysis:** Performs stability analysis based on Routh-Hurwitz, Nyquist, and Bode criteria.
- **Graph Visualization:** Automatically generates Nyquist and Bode plots based on the provided transfer function.
- **Root Analysis:** Identifies and displays the roots of the characteristic equation and explains their impact on the system's stability.
- **Export Results:** Allows exporting the analysis results in PDF or MATLAB for further processing and study.
- **Save Transfer Functions:** Users can save and reload transfer functions for future use.
- **Interactive Interface:** The app provides an intuitive user interface for analyzing and visualizing control systems.

## Installation

To run the project locally, follow these steps:

1. Clone the repository:

    ```bash
    git clone https://github.com/romankyktenko/system-stability-analyzer.git
    cd system-stability-analyzer
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Start the development server:

    ```bash
    npm start
    ```

   The app will be available at `http://localhost:3000`.

## Deployment

To deploy System Stability Analyzer to a hosting service such as [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/), follow these steps:

1. Build the production version of the app:

    ```bash
    npm run build
    ```

2. Deploy the contents of the `build` folder using your preferred deployment platform.

## Usage

1. **Input the Transfer Function:** Enter the numerator and denominator coefficients of your transfer function into the respective input fields. For example, for the transfer function:

   \[
   \frac{1s^2 + 3s + 5}{2s^2 + 4s + 6}
   \]

   you would enter `1,3,5` for the numerator and `2,4,6` for the denominator.

2. **Analyze the System:** Click the "Analyze" button to perform the stability analysis. The app will generate Nyquist and Bode plots, perform root analysis, and provide a detailed textual explanation of the system's stability.

3. **Export Results:** You can export the results in PDF format or generate a MATLAB script for further analysis by clicking the corresponding buttons.

4. **Save Transfer Functions:** Use the "Save" button to store your transfer functions for future use, and access saved functions from the "Saved Functions" menu.

## Technologies Used

- **React** with TypeScript for the frontend
- **Material UI** for the UI components
- **Chart.js** for plotting Nyquist and Bode graphs
- **Math.js** for mathematical calculations and root analysis
- **jsPDF** for PDF generation
- **html2canvas** for capturing and exporting graphical elements
- **MATLAB Export** for generating MATLAB scripts

## License

This project is licensed under the MIT License.

## Contributing

Contributions are welcome! If you have any suggestions or want to report a bug, feel free to open an issue or submit a pull request.
