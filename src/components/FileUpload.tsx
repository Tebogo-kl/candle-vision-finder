
import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { toast } from '../components/ui/use-toast';
import { Upload, Image } from 'lucide-react';
import { parseCSV } from '../utils/csvParser';
import { processImageForComparison } from '../utils/imageProcessing';
import { useData } from '../contexts/DataContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';

const FileUpload: React.FC = () => {
  const { setChartData, setLoading, setError, setSelectedImage } = useData();
  const [dragActive, setDragActive] = useState(false);
  const [fileType, setFileType] = useState<'csv' | 'image' | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    // Determine file type
    if (file.name.toLowerCase().endsWith('.csv')) {
      handleCSVFile(file);
    } else if (file.type.startsWith('image/')) {
      handleImageFile(file);
    } else {
      toast({
        title: "Unsupported file type",
        description: "Please upload a CSV file for price data or an image for pattern comparison",
        variant: "destructive"
      });
    }
  };

  const handleCSVFile = (file: File) => {
    setFileType('csv');
    setLoading(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvContent = e.target?.result as string;
        const parsedData = parseCSV(csvContent);
        
        if (parsedData.length === 0) {
          throw new Error("No valid data found in CSV");
        }
        
        setChartData(parsedData);
        toast({
          title: "CSV Loaded Successfully",
          description: `Loaded ${parsedData.length} data points from ${file.name}`
        });
        
        setLoading(false);
        setError(null);
      } catch (error) {
        console.error("Error parsing CSV:", error);
        setError(`Error parsing CSV: ${error instanceof Error ? error.message : String(error)}`);
        setLoading(false);
        
        toast({
          title: "Error Loading CSV",
          description: `Failed to parse ${file.name}`,
          variant: "destructive"
        });
      }
    };
    
    reader.onerror = () => {
      setError("Error reading file");
      setLoading(false);
      
      toast({
        title: "Error Reading File",
        description: "Failed to read the file",
        variant: "destructive"
      });
    };
    
    reader.readAsText(file);
  };

  const handleImageFile = async (file: File) => {
    setFileType('image');
    setLoading(true);
    
    try {
      const imageUrl = await processImageForComparison(file);
      setSelectedImage(imageUrl);
      
      toast({
        title: "Image Loaded",
        description: "Image ready for pattern analysis"
      });
      
      setLoading(false);
    } catch (error) {
      console.error("Error processing image:", error);
      setError(`Error processing image: ${error instanceof Error ? error.message : String(error)}`);
      setLoading(false);
      
      toast({
        title: "Error Processing Image",
        description: "Failed to process the image",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Upload Data</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 transition-all
            ${dragActive ? 'border-primary bg-secondary/20' : 'border-border'}
            hover:border-primary hover:bg-secondary/10`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center space-y-4 text-center">
            {fileType === 'csv' ? (
              <Upload className="h-10 w-10 text-primary" />
            ) : fileType === 'image' ? (
              <Image className="h-10 w-10 text-primary" />
            ) : (
              <div className="flex space-x-4">
                <Upload className="h-10 w-10 text-muted-foreground" />
                <Image className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
            
            <div>
              <p className="text-sm font-medium">
                Drag & drop or click to upload
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Upload CSV for price data or image for pattern comparison
              </p>
            </div>
            
            <Button
              variant="outline"
              onClick={() => document.getElementById('file-upload')?.click()}
              className="mt-2"
            >
              Select File
            </Button>
            
            <input
              id="file-upload"
              type="file"
              accept=".csv,image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUpload;
