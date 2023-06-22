import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PdfViewerProps {
    title: string; // URL or local path of the PDF file
}

export function PdfViewer(props: PdfViewerProps) {
    const [numPages, setNumPages] = useState<number | null>(null);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    return (
        <div className="flex items-center justify-center">
            <Document
                file={props.title === 'Terms of Service' ? '/solanaPayTos.pdf' : '/solanaPayPrivacy.pdf'}
                onLoadSuccess={onDocumentLoadSuccess}
            >
                {Array.from(new Array(numPages ? numPages : 0), (el, index) => (
                    <Page
                        key={`page_${index + 1}`}
                        pageNumber={index + 1}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                    />
                ))}
            </Document>
        </div>
    );
}
