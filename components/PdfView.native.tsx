import React from "react";
import Pdf from "react-native-pdf";

interface PdfViewProps {
  source: { uri: string; cache?: boolean };
  style?: any;
  onLoadComplete?: (numberOfPages: number, filePath: string) => void;
  onPageSingleTap?: (page: number, x: number, y: number) => void;
  onError?: (error: any) => void;
  trustAllCerts?: boolean;
}

export default function PdfView(props: PdfViewProps) {
  return <Pdf {...props} />;
}
