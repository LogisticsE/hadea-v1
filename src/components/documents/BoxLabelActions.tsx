'use client';

import { GenerateLabelButton } from './GenerateLabelButton';

interface BoxLabelActionsProps {
  boxId: string;
  boxNumber: number;
  outboundGenerated?: boolean;
  outboundGeneratedAt?: Date | string | null;
  sampleGenerated?: boolean;
  sampleGeneratedAt?: Date | string | null;
  onLabelGenerated?: () => void;
  className?: string;
}

/**
 * Combined component showing both outbound and sample label generation buttons
 * for a single box. Use this in order detail pages.
 */
export function BoxLabelActions({
  boxId,
  boxNumber,
  outboundGenerated = false,
  outboundGeneratedAt,
  sampleGenerated = false,
  sampleGeneratedAt,
  onLabelGenerated,
  className,
}: BoxLabelActionsProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="text-sm font-medium text-muted-foreground mb-2">
        Box {boxNumber} Labels
      </div>
      <div className="flex flex-wrap gap-2">
        <GenerateLabelButton
          boxId={boxId}
          labelType="OUTBOUND_CONTENT"
          isGenerated={outboundGenerated}
          generatedAt={outboundGeneratedAt}
          onGenerated={onLabelGenerated}
        />
        <GenerateLabelButton
          boxId={boxId}
          labelType="SAMPLE_CONTENT"
          isGenerated={sampleGenerated}
          generatedAt={sampleGeneratedAt}
          onGenerated={onLabelGenerated}
        />
      </div>
    </div>
  );
}
