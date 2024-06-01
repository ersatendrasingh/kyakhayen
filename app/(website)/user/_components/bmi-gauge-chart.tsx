"use client";
import GaugeChart from "react-gauge-chart";

interface BmiGaugeChartProps {
  bmi: number;
}

const BmiGaugeChart: React.FC<BmiGaugeChartProps> = ({ bmi }) => {
  const getBmiCategory = (bmi: number) => {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 24.9) return "Healthy weight";
    if (bmi < 29.9) return "Overweight";
    return "Obese";
  };

  const getBmiColor = (bmi: number) => {
    if (bmi < 18.5) return "#f5b342";
    if (bmi < 24.9) return "#5cb85c";
    if (bmi < 29.9) return "#f0ad4e";
    return "#d9534f";
  };

  const bmiPercent = Math.min(bmi / 40, 1); // Cap the percentage at 1

  return (
    <div className="text-center">
      <div className="mb-4">
        <GaugeChart
          id="bmi-gauge"
          nrOfLevels={4}
          colors={["#f5b342", "#5cb85c", "#f0ad4e", "#d9534f"]}
          arcWidth={0.3}
          percent={bmiPercent}
          textColor="#000000"
          needleColor="#464A4F"
          formatTextValue={() => `${bmi}`}
        />
      </div>
      <p className="text-xl font-semibold" style={{ color: getBmiColor(bmi) }}>
        BMI: {bmi} ({getBmiCategory(bmi)})
      </p>
      <p>
        A BMI of less than 18.5 is considered underweight. A BMI of 18.5–24.9 is
        considered healthy. A BMI of 25–29.9 is considered overweight. A BMI of
        30 or higher is considered obese.
      </p>
    </div>
  );
};

export default BmiGaugeChart;
