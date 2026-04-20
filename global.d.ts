/**
 * Type declarations for external libraries loaded via CDN
 */

// PDF.js types
declare const pdfjsLib: {
  GlobalWorkerOptions: {
    workerSrc: string;
  };
  getDocument: (src: { data: ArrayBuffer }) => {
    promise: Promise<PDFDocumentProxy>;
  };
};

interface PDFDocumentProxy {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PDFPageProxy>;
}

interface PDFPageProxy {
  getTextContent: () => Promise<PDFTextContent>;
}

interface PDFTextContent {
  items: Array<{ str: string }>;
}

// PapaParse types
declare const Papa: {
  parse: <T = Record<string, string>>(
    input: File | string,
    config: {
      complete: (results: { data: T[] }) => void;
      header: boolean;
    }
  ) => void;
};
