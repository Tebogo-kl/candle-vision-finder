
import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Slider } from '../components/ui/slider';
import { toast } from '../components/ui/use-toast';
import { Search } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { findSimilarPatterns } from '../utils/imageProcessing';

const PatternAnalysis: React.FC = () => {
  const { chartState, selectedImage, setAnalysisResults } = useData();
  const { data } = chartState;
  
  const [patternLength, setPatternLength] = useState<number>(20);
  const [numResults, setNumResults] = useState<number>(5);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const handleAnalyze = async () => {
    if (!selectedImage) {
      toast({
        title: "No Image Selected",
        description: "Please upload an image for pattern comparison",
        variant: "destructive"
      });
      return;
    }

    if (data.length < patternLength) {
      toast({
        title: "Not Enough Data",
        description: `Need at least ${patternLength} data points for analysis`,
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const startTime = performance.now();
      const matches = await findSimilarPatterns(selectedImage, data, patternLength, numResults);
      const endTime = performance.now();
      const processingTime = (endTime - startTime) / 1000; // Convert to seconds
      
      setAnalysisResults({
        matches,
        processingTime,
        imagePreview: selectedImage
      });
      
      toast({
        title: "Analysis Complete",
        description: `Found ${matches.length} potential pattern matches`,
      });
    } catch (error) {
      console.error("Error in pattern analysis:", error);
      
      toast({
        title: "Analysis Error",
        description: `Error during pattern analysis: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Pattern Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        {selectedImage ? (
          <div className="space-y-4">
            <div className="border border-border rounded-md overflow-hidden">
              <img
                src={selectedImage}
                alt="Selected pattern"
                className="w-full h-48 object-contain"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="pattern-length">Pattern Length</Label>
                <span className="text-sm text-muted-foreground">{patternLength} candles</span>
              </div>
              <Slider
                id="pattern-length"
                min={5}
                max={50}
                step={1}
                value={[patternLength]}
                onValueChange={(values) => setPatternLength(values[0])}
                className="py-2"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="num-results">Results to Show</Label>
                <span className="text-sm text-muted-foreground">{numResults} matches</span>
              </div>
              <Slider
                id="num-results"
                min={1}
                max={10}
                step={1}
                value={[numResults]}
                onValueChange={(values) => setNumResults(values[0])}
                className="py-2"
              />
            </div>
            
            <Button
              className="w-full"
              onClick={handleAnalyze}
              disabled={isAnalyzing || !data.length}
            >
              {isAnalyzing ? (
                <>
                  <div className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Analyzing Pattern...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Find Similar Patterns
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Upload an image to analyze pattern similarities
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatternAnalysis;
