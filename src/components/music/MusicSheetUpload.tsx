import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileMusic, Image, FileText, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UploadedSheet {
  id: string;
  title: string;
  composer: string;
  key_signature: string;
  time_signature: string;
  tempo: number;
  parts: Record<string, string>;
  part_notes: Record<string, string[]>;
  processing_status: string;
}

interface MusicSheetUploadProps {
  onSheetProcessed?: (sheet: UploadedSheet) => void;
}

type FileCategory = 'pdf' | 'image' | 'midi';

function getFileCategory(file: File): FileCategory | null {
  const mimeType = file.type.toLowerCase();
  const ext = file.name.split('.').pop()?.toLowerCase() || '';

  if (mimeType === 'application/pdf' || ext === 'pdf') return 'pdf';
  if (mimeType.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp', 'bmp', 'tiff'].includes(ext)) return 'image';
  if (mimeType === 'audio/midi' || mimeType === 'audio/x-midi' || ['mid', 'midi'].includes(ext)) return 'midi';

  return null;
}

function getFileIcon(category: FileCategory) {
  switch (category) {
    case 'pdf': return <FileText className="w-5 h-5" />;
    case 'image': return <Image className="w-5 h-5" />;
    case 'midi': return <FileMusic className="w-5 h-5" />;
  }
}

export function MusicSheetUpload({ onSheetProcessed }: MusicSheetUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadedSheet | null>(null);

  const handleFile = useCallback(async (file: File) => {
    const category = getFileCategory(file);
    if (!category) {
      toast.error('Unsupported file type. Please upload a PDF, image, or MIDI file.');
      return;
    }

    setError(null);
    setResult(null);
    setUploading(true);
    setProgress(10);
    setStatusText(`Uploading ${file.name}...`);

    try {
      // 1. Upload file to storage
      const filePath = `uploads/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('music-sheets')
        .upload(filePath, file);

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      setProgress(30);
      setStatusText('File uploaded, creating record...');

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('music-sheets')
        .getPublicUrl(filePath);

      const storageUrl = urlData.publicUrl;

      // 2. Create database record
      const { data: sheetRecord, error: dbError } = await supabase
        .from('uploaded_sheets')
        .insert({
          file_name: file.name,
          file_type: category,
          storage_path: filePath,
          original_url: storageUrl,
        })
        .select()
        .single();

      if (dbError) throw new Error(`Database error: ${dbError.message}`);

      setProgress(50);
      setStatusText('Processing with AI...');
      setUploading(false);
      setProcessing(true);

      // 3. Call the edge function to process
      const { data: processResult, error: processError } = await supabase.functions.invoke(
        'process-music-sheet',
        {
          body: {
            sheetId: sheetRecord.id,
            fileType: category,
            storageUrl,
          },
        }
      );

      if (processError) throw new Error(`Processing error: ${processError.message}`);

      setProgress(80);
      setStatusText('Fetching results...');

      // 4. Fetch the completed record
      const { data: completedSheet, error: fetchError } = await supabase
        .from('uploaded_sheets')
        .select('*')
        .eq('id', sheetRecord.id)
        .maybeSingle();

      if (fetchError) throw new Error(`Fetch error: ${fetchError.message}`);
      if (!completedSheet) throw new Error('Could not find processed sheet');

      setProgress(100);
      setStatusText('Done!');

      const uploadedSheet: UploadedSheet = {
        id: completedSheet.id,
        title: completedSheet.title || 'Untitled',
        composer: completedSheet.composer || 'Unknown',
        key_signature: completedSheet.key_signature || 'C',
        time_signature: completedSheet.time_signature || '4/4',
        tempo: completedSheet.tempo || 100,
        parts: (completedSheet.parts as Record<string, string>) || {},
        part_notes: (completedSheet.part_notes as Record<string, string[]>) || {},
        processing_status: completedSheet.processing_status,
      };

      setResult(uploadedSheet);
      toast.success(`"${uploadedSheet.title}" processed successfully!`);
      onSheetProcessed?.(uploadedSheet);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Upload/processing error:', err);
      setError(message);
      toast.error(message);
    } finally {
      setUploading(false);
      setProcessing(false);
    }
  }, [onSheetProcessed]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  }, [handleFile]);

  const reset = () => {
    setProgress(0);
    setStatusText('');
    setError(null);
    setResult(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-primary/20 bg-card/80 backdrop-blur-sm overflow-hidden">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Upload className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg font-display">Upload Music Sheet</CardTitle>
                <p className="text-sm text-muted-foreground">
                  PDF, Image, or MIDI → AI transcription
                </p>
              </div>
            </div>
            {(result || error) && (
              <Button variant="ghost" size="icon" onClick={reset}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <AnimatePresence mode="wait">
            {!uploading && !processing && !result && !error && (
              <motion.div
                key="dropzone"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <label
                  className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 cursor-pointer transition-colors ${
                    isDragOver
                      ? 'border-primary bg-primary/10'
                      : 'border-border/50 hover:border-primary/50 hover:bg-primary/5'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.bmp,.tiff,.mid,.midi"
                    onChange={handleFileInput}
                  />
                  <Upload className="w-10 h-10 text-muted-foreground mb-3" />
                  <p className="text-sm font-medium text-foreground mb-1">
                    Drop your music sheet here
                  </p>
                  <p className="text-xs text-muted-foreground">
                    or click to browse
                  </p>
                  <div className="flex gap-3 mt-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <FileText className="w-3.5 h-3.5" /> PDF
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Image className="w-3.5 h-3.5" /> Image
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <FileMusic className="w-3.5 h-3.5" /> MIDI
                    </div>
                  </div>
                </label>
              </motion.div>
            )}

            {(uploading || processing) && (
              <motion.div
                key="progress"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4 py-6"
              >
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <div className="w-full space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-center text-muted-foreground">{statusText}</p>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3 py-6"
              >
                <AlertCircle className="w-8 h-8 text-destructive" />
                <p className="text-sm text-destructive text-center">{error}</p>
                <Button variant="outline" size="sm" onClick={reset}>
                  Try Again
                </Button>
              </motion.div>
            )}

            {result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{result.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {result.composer} • {result.key_signature} • {result.time_signature} • {result.tempo} BPM
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(result.parts).map((part) => (
                    <span
                      key={part}
                      className="px-2.5 py-1 text-xs rounded-full bg-secondary text-secondary-foreground"
                    >
                      {part.charAt(0).toUpperCase() + part.slice(1)}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  ✨ This piece is now loaded for practice. Ask Maestro to practice any part!
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
