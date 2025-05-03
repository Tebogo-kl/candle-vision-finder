
import React, { useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { MatchResult } from '../types/chartTypes';
import { useData } from '../contexts/DataContext';
import { format } from 'date-fns';
import { calculateChartDimensions, getCandleColor } from '../utils/chartUtils';

const ResultsDisplay: React.FC = () => {
  const { analysisResults } = useData();
  
  if (!analysisResults || analysisResults.matches.length === 0) {
    return null;
  }
  
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Analysis Results</CardTitle>
        <div className="text-sm text-muted-foreground">
          Processed in {analysisResults.processingTime.toFixed(2)}s
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {analysisResults.matches.map((match, index) => (
            <MatchCard key={index} match={match} rank={index + 1} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const MatchCard: React.FC<{ match: MatchResult; rank: number }> = ({ match, rank }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { timestamp, similarity, previewData } = match;
  
  // Render mini chart
  useEffect(() => {
    if (!svgRef.current || previewData.length === 0) return;
    
    const width = 200;
    const height = 100;
    const padding = { top: 5, right: 5, bottom: 5, left: 5 };
    
    // Calculate scales
    const { xScale, yScale } = calculateChartDimensions(
      previewData, width, height, padding
    );
    
    // Calculate candle width
    const candleWidth = Math.max(
      1, 
      Math.min(6, (width - padding.left - padding.right) / previewData.length - 1)
    );
  }, [previewData]);
  
  // Prepare mini chart data
  const width = 200;
  const height = 100;
  const padding = { top: 5, right: 5, bottom: 5, left: 5 };
  const { xScale, yScale } = calculateChartDimensions(
    previewData, width, height, padding
  );
  const candleWidth = Math.max(
    1, 
    Math.min(6, (width - padding.left - padding.right) / previewData.length - 1)
  );

  return (
    <div className="flex flex-col md:flex-row justify-between items-start gap-4 border border-border rounded-lg p-3">
      <div className="flex-grow">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold text-white bg-primary rounded-full w-6 h-6 flex items-center justify-center text-xs">
            {rank}
          </span>
          <h4 className="font-medium">
            {format(timestamp, 'yyyy-MM-dd HH:mm:ss')}
          </h4>
        </div>
        
        <div className="text-sm text-muted-foreground mb-1">
          Similarity: {(similarity * 100).toFixed(2)}%
        </div>
        
        <div className="text-xs text-muted-foreground">
          Pattern length: {previewData.length} candles
        </div>
      </div>
      
      <div className="min-w-[200px]">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="overflow-visible"
        >
          {/* Background */}
          <rect x={0} y={0} width={width} height={height} fill="#1a1a1a" />
          
          {/* Candles */}
          {previewData.map((candle, i) => {
            const x = xScale(i);
            const open = yScale(candle.open);
            const close = yScale(candle.close);
            const high = yScale(candle.high);
            const low = yScale(candle.low);
            
            const color = getCandleColor(candle);
            const halfCandleWidth = candleWidth / 2;
            
            return (
              <g key={`mini-candle-${i}`} className={color}>
                {/* Wick */}
                <line
                  x1={x}
                  y1={high}
                  x2={x}
                  y2={Math.min(open, close)}
                  strokeWidth={1}
                />
                <line
                  x1={x}
                  y1={Math.max(open, close)}
                  x2={x}
                  y2={low}
                  strokeWidth={1}
                />
                
                {/* Body */}
                <rect
                  x={x - halfCandleWidth}
                  y={Math.min(open, close)}
                  width={candleWidth}
                  height={Math.abs(open - close) || 1}
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default ResultsDisplay;
