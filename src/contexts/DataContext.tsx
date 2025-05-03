
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ChartState, CandleData, AnalysisResult, MatchResult } from '../types/chartTypes';

interface DataContextType {
  chartState: ChartState;
  setChartData: (data: CandleData[]) => void;
  setSymbol: (symbol: string) => void;
  setTimeframe: (timeframe: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  analysisResults: AnalysisResult | null;
  setAnalysisResults: (results: AnalysisResult | null) => void;
  selectedImage: string | null;
  setSelectedImage: (image: string | null) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [chartState, setChartState] = useState<ChartState>({
    data: [],
    timeframe: 'M1',
    symbol: 'EURUSD',
    loading: false,
    error: null,
  });

  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const setChartData = (data: CandleData[]) => {
    setChartState((prev) => ({ ...prev, data }));
  };

  const setSymbol = (symbol: string) => {
    setChartState((prev) => ({ ...prev, symbol }));
  };

  const setTimeframe = (timeframe: any) => {
    setChartState((prev) => ({ ...prev, timeframe }));
  };

  const setLoading = (loading: boolean) => {
    setChartState((prev) => ({ ...prev, loading }));
  };

  const setError = (error: string | null) => {
    setChartState((prev) => ({ ...prev, error }));
  };

  return (
    <DataContext.Provider
      value={{
        chartState,
        setChartData,
        setSymbol,
        setTimeframe,
        setLoading,
        setError,
        analysisResults,
        setAnalysisResults,
        selectedImage,
        setSelectedImage,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
