
import { CandleData } from '../types/chartTypes';
import { format } from 'date-fns';

// Calculate chart dimensions and scaling
export const calculateChartDimensions = (
  data: CandleData[], 
  width: number, 
  height: number, 
  padding = { top: 20, right: 60, bottom: 30, left: 60 }
) => {
  if (!data || data.length === 0) {
    return { xScale: (i: number) => 0, yScale: (price: number) => 0, volumeScale: (vol: number) => 0 };
  }
  
  // Find min/max values
  const minPrice = Math.min(...data.map(d => d.low));
  const maxPrice = Math.max(...data.map(d => d.high));
  const maxVolume = Math.max(...data.map(d => d.volume));
  
  // Add some padding to price range
  const pricePadding = (maxPrice - minPrice) * 0.1;
  const paddedMinPrice = minPrice - pricePadding;
  const paddedMaxPrice = maxPrice + pricePadding;
  
  // Calculate available space
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const priceHeight = chartHeight * 0.8; // 80% for price, 20% for volume
  const volumeHeight = chartHeight * 0.2;
  
  // Create scaling functions
  const xScale = (i: number) => padding.left + (i * chartWidth / (data.length - 1));
  
  const yScale = (price: number) => 
    padding.top + priceHeight - 
    ((price - paddedMinPrice) / (paddedMaxPrice - paddedMinPrice) * priceHeight);
    
  const volumeScale = (vol: number) => 
    (height - padding.bottom) - 
    (vol / maxVolume * volumeHeight);
  
  return {
    xScale,
    yScale,
    volumeScale,
    minPrice: paddedMinPrice,
    maxPrice: paddedMaxPrice,
    maxVolume,
    chartWidth,
    chartHeight,
    priceHeight,
    volumeHeight
  };
};

// Generate grid lines
export const generateGridLines = (
  width: number, 
  height: number, 
  priceRange: { min: number, max: number },
  timePoints: Date[],
  padding = { top: 20, right: 60, bottom: 30, left: 60 }
) => {
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  // Generate horizontal price lines
  const priceLines = [];
  const priceStep = (priceRange.max - priceRange.min) / 5;
  
  for (let i = 0; i <= 5; i++) {
    const price = priceRange.min + (i * priceStep);
    const y = padding.top + chartHeight - 
              ((price - priceRange.min) / (priceRange.max - priceRange.min) * chartHeight);
    
    priceLines.push({
      y,
      price,
      label: price.toFixed(5)
    });
  }
  
  // Generate vertical time lines (use every nth time point)
  const timeLines = [];
  const skipFactor = Math.ceil(timePoints.length / 10); // Show roughly 10 time labels
  
  for (let i = 0; i < timePoints.length; i += skipFactor) {
    const time = timePoints[i];
    const x = padding.left + (i / (timePoints.length - 1)) * chartWidth;
    
    timeLines.push({
      x,
      time,
      label: format(time, 'HH:mm')
    });
  }
  
  return { priceLines, timeLines };
};

// Get candle color
export const getCandleColor = (candle: CandleData) => {
  return candle.close >= candle.open ? 'candle-green' : 'candle-red';
};
