
import React, { useRef, useEffect, useState } from 'react';
import { CandleData } from '../types/chartTypes';
import { calculateChartDimensions, generateGridLines, getCandleColor } from '../utils/chartUtils';
import { formatDateTime } from '../utils/csvParser';
import { useData } from '../contexts/DataContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { format } from 'date-fns';

const CandlestickChart: React.FC = () => {
  const { chartState } = useData();
  const { data, symbol, timeframe } = chartState;
  
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [mousePosition, setMousePosition] = useState<{ x: number, y: number } | null>(null);
  const [hoveredCandle, setHoveredCandle] = useState<CandleData | null>(null);
  
  // Handle window resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);
  
  // Render chart
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;
    
    const { width, height } = dimensions;
    const padding = { top: 20, right: 70, bottom: 30, left: 70 };
    
    // Calculate scales
    const { 
      xScale, 
      yScale, 
      volumeScale, 
      minPrice, 
      maxPrice, 
      maxVolume 
    } = calculateChartDimensions(data, width, height, padding);
    
    // Generate grid lines
    const grid = generateGridLines(
      width, 
      height, 
      { min: minPrice, max: maxPrice },
      data.map(d => d.time),
      padding
    );
    
    // SVG content for chart
    const candleWidth = Math.max(
      2, 
      Math.min(10, (width - padding.left - padding.right) / data.length - 2)
    );
    
    // Find candle under cursor
    const handleMouseMove = (e: MouseEvent) => {
      if (!svgRef.current) return;
      
      const svgRect = svgRef.current.getBoundingClientRect();
      const x = e.clientX - svgRect.left;
      const y = e.clientY - svgRect.top;
      
      setMousePosition({ x, y });
      
      // Find nearest candle
      const chartX = x - padding.left;
      const dataIndex = Math.round(chartX / ((width - padding.left - padding.right) / (data.length - 1)));
      
      if (dataIndex >= 0 && dataIndex < data.length) {
        setHoveredCandle(data[dataIndex]);
      } else {
        setHoveredCandle(null);
      }
    };
    
    const handleMouseLeave = () => {
      setMousePosition(null);
      setHoveredCandle(null);
    };
    
    svgRef.current.addEventListener('mousemove', handleMouseMove);
    svgRef.current.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      if (svgRef.current) {
        svgRef.current.removeEventListener('mousemove', handleMouseMove);
        svgRef.current.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [data, dimensions]);
  
  if (data.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle>Chart</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[500px]">
          <p className="text-muted-foreground">No data available. Upload a CSV file to display chart.</p>
        </CardContent>
      </Card>
    );
  }
  
  const { width, height } = dimensions;
  const padding = { top: 20, right: 70, bottom: 30, left: 70 };
  
  // Calculate chart dimensions
  const { 
    xScale, 
    yScale, 
    volumeScale, 
    minPrice, 
    maxPrice 
  } = calculateChartDimensions(data, width, height, padding);
  
  // Generate grid lines
  const grid = generateGridLines(
    width, 
    height, 
    { min: minPrice, max: maxPrice },
    data.map(d => d.time),
    padding
  );
  
  const candleWidth = Math.max(
    2, 
    Math.min(10, (width - padding.left - padding.right) / data.length - 2)
  );

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle>{symbol}, {timeframe}</CardTitle>
        <div className="text-sm text-muted-foreground">
          Displaying {data.length} candles
        </div>
      </CardHeader>
      <CardContent>
        <div ref={containerRef} className="w-full h-[500px]">
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox={`0 0 ${width} ${height}`}
            className="overflow-visible"
          >
            {/* Background */}
            <rect x={0} y={0} width={width} height={height} fill="#1a1a1a" />
            
            {/* Grid lines */}
            {grid.priceLines.map((line, i) => (
              <g key={`price-line-${i}`}>
                <line
                  x1={padding.left}
                  y1={line.y}
                  x2={width - padding.right}
                  y2={line.y}
                  className="chart-grid"
                />
                <text
                  x={width - padding.right + 5}
                  y={line.y + 4}
                  fontSize="10"
                  fill="#d1d4dc"
                >
                  {parseFloat(line.price.toFixed(5))}
                </text>
              </g>
            ))}
            
            {grid.timeLines.map((line, i) => (
              <g key={`time-line-${i}`}>
                <line
                  x1={line.x}
                  y1={padding.top}
                  x2={line.x}
                  y2={height - padding.bottom}
                  className="chart-grid"
                />
                <text
                  x={line.x}
                  y={height - padding.bottom + 15}
                  fontSize="10"
                  fill="#d1d4dc"
                  textAnchor="middle"
                >
                  {line.label}
                </text>
              </g>
            ))}
            
            {/* Candles */}
            {data.map((candle, i) => {
              const x = xScale(i);
              const open = yScale(candle.open);
              const close = yScale(candle.close);
              const high = yScale(candle.high);
              const low = yScale(candle.low);
              const vol = volumeScale(candle.volume);
              
              const color = getCandleColor(candle);
              const halfCandleWidth = candleWidth / 2;
              
              return (
                <g key={`candle-${i}`} className={color}>
                  {/* Volume */}
                  <rect
                    x={x - halfCandleWidth}
                    y={vol}
                    width={candleWidth}
                    height={height - padding.bottom - vol}
                    opacity={0.5}
                  />
                  
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
            
            {/* Crosshair */}
            {mousePosition && (
              <>
                <line
                  x1={padding.left}
                  y1={mousePosition.y}
                  x2={width - padding.right}
                  y2={mousePosition.y}
                  className="crosshair"
                />
                <line
                  x1={mousePosition.x}
                  y1={padding.top}
                  x2={mousePosition.x}
                  y2={height - padding.bottom}
                  className="crosshair"
                />
              </>
            )}
            
            {/* Price axis labels */}
            {mousePosition && (
              <text
                x={width - padding.right + 5}
                y={mousePosition.y + 4}
                fontSize="11"
                fill="#ffcc00"
                fontWeight="bold"
              >
                {(
                  minPrice + (maxPrice - minPrice) * 
                  (1 - (mousePosition.y - padding.top) / (height - padding.top - padding.bottom))
                ).toFixed(5)}
              </text>
            )}
          </svg>
          
          {/* Tooltip */}
          {hoveredCandle && (
            <div
              className="absolute bg-black bg-opacity-90 border border-gray-700 rounded p-2 text-xs"
              style={{
                left: Math.min(dimensions.width - 160, mousePosition?.x || 0),
                top: Math.min(dimensions.height - 100, (mousePosition?.y || 0) + 20)
              }}
            >
              <div className="font-bold mb-1">
                {format(hoveredCandle.time, 'yyyy-MM-dd HH:mm:ss')}
              </div>
              <div className="grid grid-cols-2 gap-x-2">
                <div className="text-gray-400">Open:</div>
                <div>{hoveredCandle.open.toFixed(5)}</div>
                <div className="text-gray-400">High:</div>
                <div>{hoveredCandle.high.toFixed(5)}</div>
                <div className="text-gray-400">Low:</div>
                <div>{hoveredCandle.low.toFixed(5)}</div>
                <div className="text-gray-400">Close:</div>
                <div className={hoveredCandle.close >= hoveredCandle.open ? "text-chart-up" : "text-chart-down"}>
                  {hoveredCandle.close.toFixed(5)}
                </div>
                <div className="text-gray-400">Volume:</div>
                <div>{hoveredCandle.volume.toFixed(2)}</div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CandlestickChart;
