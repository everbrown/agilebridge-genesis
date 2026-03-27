import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface IngestZoneProps {
  onFileAccepted: (file: File) => void;
  acceptedFile: File | null;
  onClear: () => void;
}

const ACCEPTED_TYPES = ['.mpp', '.pdf', '.docx', '.csv', '.txt', '.md'];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

const IngestZone = ({ onFileAccepted, acceptedFile, onClear }: IngestZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const validateAndAccept = useCallback((file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      toast({ title: 'File too large', description: `Maximum file size is 20 MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)} MB.`, variant: 'destructive' });
      return;
    }
    onFileAccepted(file);
  }, [onFileAccepted]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndAccept(file);
  }, [validateAndAccept]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndAccept(file);
  }, [validateAndAccept]);

  if (acceptedFile) {
    return (
      <div className="surface-elevated rounded-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{acceptedFile.name}</p>
              <p className="text-xs text-muted-foreground tabular-nums">
                {(acceptedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          <button onClick={onClear} className="p-2 rounded-sm hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.005 }}
      transition={{ type: "spring", duration: 0.3, bounce: 0 }}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`relative rounded-sm border-2 border-dashed p-6 sm:p-12 transition-colors cursor-pointer ${
        isDragging ? 'border-primary bg-primary/5' : 'border-border bg-muted/30 hover:border-primary/50'
      }`}
    >
      <input
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="flex flex-col items-center gap-3 pointer-events-none">
        <div className="w-12 h-12 rounded-sm bg-muted flex items-center justify-center">
          <Upload className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">Drop your project file here</p>
          <p className="text-xs text-muted-foreground mt-1">
            Accepts {ACCEPTED_TYPES.join(', ')} — Max 20 MB
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default IngestZone;
