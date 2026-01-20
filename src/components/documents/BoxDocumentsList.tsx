'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BoxDocument {
  id: string;
  documentType: string;
  fileName: string;
  filePath: string;
  fileSize: number | null;
  mimeType: string | null;
  generatedAt: string;
}

interface BoxDocumentsListProps {
  boxId: string;
  className?: string;
}

export function BoxDocumentsList({ boxId, className }: BoxDocumentsListProps) {
  const [documents, setDocuments] = useState<BoxDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/boxes/${boxId}/generate-label`);
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [boxId]);

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDocumentType = (type: string): string => {
    const typeLabels: Record<string, string> = {
      OUTBOUND_CONTENT: 'Outbound Content Label',
      SAMPLE_CONTENT: 'Sample Content Label',
      NON_ADR: 'Non-ADR Declaration',
      SHIPPING_LABEL: 'Shipping Label',
      COMMERCIAL_INVOICE: 'Commercial Invoice',
      PACKING_LIST: 'Packing List',
    };
    return typeLabels[type] || type;
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading documents...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 ${className}`}>
        <p className="text-sm text-destructive">{error}</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchDocuments}
          className="mt-2 gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className={`p-4 text-center ${className}`}>
        <FileText className="h-8 w-8 mx-auto text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground mt-2">No documents generated yet</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium">Generated Documents</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchDocuments}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-2">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between p-3 rounded-lg border bg-card"
          >
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{formatDocumentType(doc.documentType)}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(doc.generatedAt).toLocaleString()} · {formatFileSize(doc.fileSize)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              asChild
            >
              <a href={doc.filePath} download={doc.fileName}>
                <Download className="h-4 w-4" />
                Download
              </a>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
