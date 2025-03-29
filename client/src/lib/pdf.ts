import * as pdfjs from 'pdfjs-dist';

// Set the worker source path
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Extract text from a PDF file
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    // Load the PDF file
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    
    let text = '';
    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(' ');
      text += pageText + '\n\n';
    }
    
    return text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

// Render a PDF page to a canvas element
export async function renderPageToCanvas(
  file: File, 
  pageNumber: number, 
  canvas: HTMLCanvasElement, 
  scale: number = 1.0
): Promise<void> {
  try {
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    // Load the PDF file
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    
    // Check if page number is valid
    if (pageNumber < 1 || pageNumber > pdf.numPages) {
      throw new Error(`Invalid page number: ${pageNumber}`);
    }
    
    // Get the page
    const page = await pdf.getPage(pageNumber);
    
    // Set canvas dimensions
    const viewport = page.getViewport({ scale });
    const context = canvas.getContext('2d');
    
    if (!context) {
      throw new Error('Failed to get canvas context');
    }
    
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    // Render the page
    await page.render({
      canvasContext: context,
      viewport,
    }).promise;
  } catch (error) {
    console.error('Error rendering PDF page:', error);
    throw new Error('Failed to render PDF page');
  }
}

// Get number of pages in a PDF file
export async function getPageCount(file: File): Promise<number> {
  try {
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    // Load the PDF file
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    return pdf.numPages;
  } catch (error) {
    console.error('Error getting page count:', error);
    throw new Error('Failed to get PDF page count');
  }
      }
