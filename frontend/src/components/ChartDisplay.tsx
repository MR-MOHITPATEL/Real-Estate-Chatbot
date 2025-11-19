import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

import type { AnalysisResponse, ChartData } from "../types/chat";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);

interface ChartDisplayProps {
  data: ChartData;
  type: AnalysisResponse["chart_type"];
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom" as const,
      labels: {
        color: "#cbd5f5",
        usePointStyle: true,
      },
    },
    tooltip: {
      mode: "index" as const,
      intersect: false,
      backgroundColor: "rgba(15,23,42,0.85)",
      borderColor: "rgba(255,255,255,0.1)",
      borderWidth: 1,
      padding: 12,
    },
  },
  interaction: {
    mode: "index" as const,
    intersect: false,
  },
  scales: {
    x: {
      ticks: {
        color: "#cbd5f5",
      },
      grid: {
        color: "rgba(255,255,255,0.08)",
      },
    },
    y: {
      ticks: {
        color: "#cbd5f5",
      },
      grid: {
        color: "rgba(255,255,255,0.08)",
      },
    },
  },
};

const palette = [
  "rgba(139, 92, 246, 0.8)",
  "rgba(14, 165, 233, 0.8)",
  "rgba(248, 113, 113, 0.8)",
  "rgba(52, 211, 153, 0.8)",
];

export const ChartDisplay = ({ data, type }: ChartDisplayProps) => {
  const datasets = data.datasets.map((dataset, idx) => ({
    ...dataset,
    borderColor: palette[idx % palette.length],
    backgroundColor:
      type === "bar"
        ? palette[idx % palette.length]
        : palette[idx % palette.length].replace("0.8", "0.35"),
    borderWidth: 3,
    fill: type === "line",
    tension: 0.3,
    pointRadius: 4,
    pointHoverRadius: 6,
  }));

  const config = {
    labels: data.labels,
    datasets,
  };

  return (
    <div className="h-[320px] w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/70 to-slate-900/30 p-4 shadow-lg">
      {type === "bar" ? (
        <Bar data={config} options={chartOptions} />
      ) : (
        <Line data={config} options={chartOptions} />
      )}
    </div>
  );
};


