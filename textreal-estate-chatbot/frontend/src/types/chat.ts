export type ChartType = "line" | "bar";

export interface ChartDataset {
  label: string;
  data: Array<number | null>;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface TableRow {
  final_location: string;
  year: number;
  metric_value: number | null;
  total_units?: number | null;
  total_sales?: number | null;
  [key: string]: string | number | null | undefined;
}

export interface AnalysisResponse {
  summary: string;
  chart_data: ChartData;
  table_data: TableRow[];
  chart_type: ChartType;
}

export interface ConversationMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  response?: AnalysisResponse;
  createdAt: string;
}


