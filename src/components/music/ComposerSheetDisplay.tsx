import { useEffect, useRef } from 'react';
import abcjs from 'abcjs';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Music2, Download, FileText, FileType } from 'lucide-react';

interface ComposerSheetDisplayProps {
  abcNotation: string;
  currentKey: string;
  onKeyChange: (key: string) => void;
  title?: string;
  tempo?: number;
  timeSignature?: string;
}

export function ComposerSheetDisplay({
  abcNotation,
  currentKey,
  onKeyChange,
  title = 'Your Composition',
  tempo = 120,
  timeSignature = '4/4',
}: ComposerSheetDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && abcNotation) {
      containerRef.current.innerHTML = '';
      try {
        abcjs.renderAbc(containerRef.current, abcNotation, {
          responsive: 'resize',
          add_classes: true,
          staffwidth: 600,
          scale: 1.3,
          paddingtop: 10,
          paddingbottom: 10,
        });
      } catch (error) {
        console.error('ABC rendering error:', error);
      }
    }
  }, [abcNotation]);

  const handleDownloadSVG = () => {
    if (containerRef.current) {
      const svg = containerRef.current.querySelector('svg');
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/\s+/g, '-').toLowerCase()}-${currentKey}.svg`;
        a.click();
        URL.revokeObjectURL(url);
      }
    }
  };

  const handleDownloadPDF = async () => {
    if (containerRef.current) {
      const svg = containerRef.current.querySelector('svg');
      if (svg) {
        // Create a canvas from SVG for PDF generation
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
          canvas.width = img.width * 2;
          canvas.height = img.height * 2;
          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Download as PNG (PDF would require a library)
            const pngUrl = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = pngUrl;
            a.download = `${title.replace(/\s+/g, '-').toLowerCase()}-${currentKey}.png`;
            a.click();
          }
        };
        
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
      }
    }
  };

  const handleDownloadMIDI = () => {
    // Generate MIDI from ABC notation
    if (abcNotation) {
      try {
        const midiBuffer = abcjs.synth.getMidiFile(abcNotation, {
          midiOutputType: 'binary',
        });
        
        if (midiBuffer) {
          const blob = new Blob([midiBuffer], { type: 'audio/midi' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${title.replace(/\s+/g, '-').toLowerCase()}-${currentKey}.mid`;
          a.click();
          URL.revokeObjectURL(url);
        }
      } catch (error) {
        console.error('MIDI generation error:', error);
        // Fallback: download ABC as text
        const blob = new Blob([abcNotation], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/\s+/g, '-').toLowerCase()}-${currentKey}.abc`;
        a.click();
        URL.revokeObjectURL(url);
      }
    }
  };

  return (
    <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-musical-gold/20">
              <Music2 className="w-5 h-5 text-musical-gold" />
            </div>
            <div>
              <CardTitle className="text-lg font-display">{title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {currentKey} Major • {tempo} BPM • {timeSignature}
              </p>
            </div>
          </div>
          <Select value={currentKey} onValueChange={onKeyChange}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map((key) => (
                <SelectItem key={key} value={key}>
                  {key} Major
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {/* Sheet music container with explicit white background */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          ref={containerRef}
          className="rounded-lg p-4 min-h-[150px] mb-4 overflow-x-auto border border-border/30"
          style={{ 
            backgroundColor: '#ffffff',
            color: '#000000',
          }}
        />

        {/* Download buttons */}
        <div className="flex flex-wrap gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={handleDownloadSVG} className="gap-2">
            <FileType className="w-4 h-4" />
            SVG
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="gap-2">
            <FileText className="w-4 h-4" />
            PNG
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadMIDI} className="gap-2">
            <Download className="w-4 h-4" />
            MIDI
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
