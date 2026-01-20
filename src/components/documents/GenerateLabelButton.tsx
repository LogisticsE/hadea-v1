'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Download, Loader2, CheckCircle } from 'lucide-react';

type LabelType = 'OUTBOUND_CONTENT' | 'SAMPLE_CONTENT';

interface GenerateLabelButtonProps {
  boxId: string;
  labelType: LabelType;
  isGenerated?: boolean;
  generatedAt?: Date | string | null;
  onGenerated?: () => void;
  className?: string;
}

export function GenerateLabelButton({
  boxId,
  labelType,
  isGenerated = false,
  generatedAt,
  onGenerated,
  className,
}: GenerateLabelButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wasGenerated, setWasGenerated] = useState(isGenerated);

  const labelTypeLabel = labelType === 'OUTBOUND_CONTENT'
    ? 'Outbound Content Label'
    : 'Sample Content Label';

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/boxes/${boxId}/generate-label`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ labelType }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate label');
      }

      // Get the PDF blob and trigger download
      const blob = await response.blob();
      const contentDisposition = response.headers.get('Content-Disposition');
      let fileName = `${labelType.toLowerCase()}_label.pdf`;

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) {
          fileName = match[1];
        }
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setWasGenerated(true);
      onGenerated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (wasGenerated) {
    return (
      <div className={className}>
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerate}
          disabled={isLoading}
          className="gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Regenerating...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-green-700">{labelTypeLabel}</span>
              <Download className="h-4 w-4 ml-1" />
            </>
          )}
        </Button>
        {generatedAt && (
          <span className="text-xs text-muted-foreground ml-2">
            Generated {new Date(generatedAt).toLocaleDateString()}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <Button
        variant="default"
        size="sm"
        onClick={handleGenerate}
        disabled={isLoading}
        className="gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <FileText className="h-4 w-4" />
            Generate {labelTypeLabel}
          </>
        )}
      </Button>
      {error && (
        <p className="text-xs text-destructive mt-1">{error}</p>
      )}
    </div>
  );
}
