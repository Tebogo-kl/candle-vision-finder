
// Chart data types
export interface CandleData {
  time: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ChartState {
  data: CandleData[];
  timeframe: Timeframe;
  symbol: string;
  loading: boolean;
  error: string | null;
}

export type Timeframe = 'M1' | 'M5' | 'M15' | 'M30' | 'H1' | 'H4' | 'D1' | 'W1';

export interface MatchResult {
  timestamp: Date;
  similarity: number;
  previewData: CandleData[];
}

export interface AnalysisResult {
  matches: MatchResult[];
  processingTime: number;
  imagePreview?: string;
}
