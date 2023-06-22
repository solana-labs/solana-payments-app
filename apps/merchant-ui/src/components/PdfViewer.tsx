import { useEffect, useRef, useState } from 'react';
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

    const containerRef = useRef(null);

    const [width, setWidth] = useState(0);
    useEffect(() => {
        if (containerRef.current) {
            setWidth(containerRef.current.offsetWidth);
        }

        const handleResize = () => {
            if (containerRef.current) {
                setWidth(containerRef.current.offsetWidth);
            }
        };

        window.addEventListener('resize', handleResize);

        // Cleanup the event listener on component unmount
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div ref={containerRef} className="flex items-center justify-center flex-grow overflow-auto">
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
                        width={width}
                    />
                ))}
            </Document>
        </div>
    );
}
