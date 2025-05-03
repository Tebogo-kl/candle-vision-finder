
import { CandleData } from '../types/chartTypes';

// Parse CSV data into candle data
export const parseCSV = (csvContent: string): CandleData[] => {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].toLowerCase().split(',');
  
  // Determine column indexes
  const dateIndex = headers.findIndex(h => 
    h.includes('date') || h.includes('time'));
  const openIndex = headers.findIndex(h => 
    h.includes('open'));
  const highIndex = headers.findIndex(h => 
    h.includes('high'));
  const lowIndex = headers.findIndex(h => 
    h.includes('low'));
  const closeIndex = headers.findIndex(h => 
    h.includes('close'));
  const volumeIndex = headers.findIndex(h => 
    h.includes('vol') || h.includes('volume'));

  // Validate required columns
  if (dateIndex === -1 || openIndex === -1 || highIndex === -1 || 
      lowIndex === -1 || closeIndex === -1) {
    throw new Error('CSV is missing required columns (date, open, high, low, close)');
  }

  const data: CandleData[] = [];
  
  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values = lines[i].split(',');
    
    // Parse date/time
    let timeValue = values[dateIndex];
    let time: Date;
    
    // Handle different date formats
    if (timeValue.match(/^\d{4}-\d{2}-\d{2}/)) {
      // ISO format
      time = new Date(timeValue);
    } else if (timeValue.match(/^\d{1,2}\/\d{1,2}\/\d{4}/)) {
      // MM/DD/YYYY format
      time = new Date(timeValue);
    } else if (timeValue.match(/^\d+$/)) {
      // Unix timestamp (seconds)
      time = new Date(parseInt(timeValue) * 1000);
    } else {
      // Try generic parsing
      time = new Date(timeValue);
    }
    
    // Parse other values
    const open = parseFloat(values[openIndex]);
    const high = parseFloat(values[highIndex]);
    const low = parseFloat(values[lowIndex]);
    const close = parseFloat(values[closeIndex]);
    const volume = volumeIndex !== -1 ? parseFloat(values[volumeIndex]) : 0;
    
    // Validate the parsed data
    if (isNaN(open) || isNaN(high) || isNaN(low) || isNaN(close) || !isFinite(time.getTime())) {
      console.warn(`Invalid data in row ${i}`, { time, open, high, low, close });
      continue;
    }
    
    data.push({
      time,
      open,
      high,
      low,
      close,
      volume
    });
  }
  
  // Sort data by time (ascending)
  return data.sort((a, b) => a.time.getTime() - b.time.getTime());
};

// Format date for display
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

// Format time for display
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

// Format datetime for display
export const formatDateTime = (date: Date): string => {
  return `${formatDate(date)} ${formatTime(date)}`;
};
