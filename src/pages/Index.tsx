
import React from 'react';
import { DataProvider } from '../contexts/DataContext';
import CandlestickChart from '../components/CandlestickChart';
import FileUpload from '../components/FileUpload';
import PatternAnalysis from '../components/PatternAnalysis';
import ResultsDisplay from '../components/ResultsDisplay';
import { Separator } from '../components/ui/separator';

const Index = () => {
  return (
    <DataProvider>
      <div className="min-h-screen bg-chart-bg text-white">
        <header className="border-b border-border py-4 px-6">
          <h1 className="text-xl font-semibold">Candle Vision Finder</h1>
          <p className="text-sm text-muted-foreground">
            Price action analysis and pattern recognition tool
          </p>
        </header>
        
        <main className="container py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CandlestickChart />
              
              <div className="mt-6">
                <ResultsDisplay />
              </div>
            </div>
            
            <div className="space-y-6">
              <FileUpload />
              <PatternAnalysis />
            </div>
          </div>
        </main>
        
        <footer className="border-t border-border py-4 px-6 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Candle Vision Finder - Price Action Analysis Tool</p>
        </footer>
      </div>
    </DataProvider>
  );
};

export default Index;
