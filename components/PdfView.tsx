import React from "react";
import { Text, View } from "react-native";

interface PdfViewProps {
  source: { uri: string; cache?: boolean };
  style?: any;
  onLoadComplete?: (numberOfPages: number, filePath: string) => void;
  onPageSingleTap?: (page: number, x: number, y: number) => void;
  onError?: (error: any) => void;
  trustAllCerts?: boolean;
}

export default function PdfView({ source, style, onError, onLoadComplete }: PdfViewProps) {
  // on web, we fall back to a simple iframe or message
  // since PdfViewerScreen already has a WebView fallback for non-PDFs
  // we can use a similar approach here or just show a message.
  
  // To avoid bundling issues, we use a simple view on web for this specific component
  // because the PDF viewer screen will handle the rendering via WebView if this returns null or an error
  
  React.useEffect(() => {
    // Simulate load completion
    if (onLoadComplete) {
      onLoadComplete(1, source.uri);
    }
  }, []);

  return (
    <View style={[style, { justifyContent: 'center', alignItems: 'center' }]}>
      <Text>PDF Viewing is handled by the browser on web.</Text>
      <iframe 
        src={source.uri} 
        style={{ width: '100%', height: '100%', border: 'none' }} 
        title="PDF Preview"
      />
    </View>
  );
}
