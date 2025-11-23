'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, CheckCircle2, XCircle, Loader2, ExternalLink, Trash2 } from 'lucide-react';
import { useFilecoin } from '@/src/hooks/useFilecoin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';

interface FilecoinUploadProps {
  onCidChange?: (cid: string | null) => void;
  label?: string;
  description?: string;
  accept?: string;
  maxSizeMB?: number;
}

export function FilecoinUpload({
  onCidChange,
  label = "Upload to Filecoin",
  description = "Store files or data on decentralized Filecoin storage",
  accept = "*/*",
  maxSizeMB = 10,
}: FilecoinUploadProps) {
  const { pinFile, pinJson, isPinning, error, getGatewayUrl } = useFilecoin();
  const [uploadedCid, setUploadedCid] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`File size exceeds ${maxSizeMB}MB limit`);
      return;
    }

    setUploadedFile(file);
    setUploadedCid(null);

    try {
      const cid = await pinFile(file);
      setUploadedCid(cid);
      onCidChange?.(cid);
    } catch (err) {
      console.error('Error uploading file:', err);
      setUploadedFile(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    setUploadedFile(null);
    setUploadedCid(null);
    onCidChange?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadJson = async () => {
    const jsonData = {
      timestamp: new Date().toISOString(),
      type: 'intent-metadata',
    };

    try {
      const cid = await pinJson(jsonData);
      setUploadedCid(cid);
      onCidChange?.(cid);
    } catch (err) {
      console.error('Error uploading JSON:', err);
    }
  };

  return (
    <Card className="border-2 border-indigo-200 dark:border-indigo-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <File className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          {label}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        {!uploadedCid ? (
          <>
            {/* File Upload Area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`
                relative border-2 border-dashed rounded-lg p-8 text-center transition-all
                ${dragActive 
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500'
                }
                ${isPinning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              onClick={() => !isPinning && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleFileInputChange}
                className="hidden"
                disabled={isPinning}
              />
              
              <AnimatePresence>
                {isPinning ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <Loader2 className="h-8 w-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Uploading to Filecoin...
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Drop a file here or click to browse
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Max size: {maxSizeMB}MB
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Or Upload JSON Button */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              <span className="text-xs text-gray-500 dark:text-gray-400">OR</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            </div>

            <Button
              onClick={handleUploadJson}
              disabled={isPinning}
              variant="outline"
              className="w-full"
            >
              <File className="h-4 w-4 mr-2" />
              Store Metadata on Filecoin
            </Button>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  Successfully stored on Filecoin
                </p>
                {uploadedFile && (
                  <p className="text-xs text-green-700 dark:text-green-300 truncate">
                    {uploadedFile.name}
                  </p>
                )}
                <p className="text-xs font-mono text-green-600 dark:text-green-400 break-all mt-1">
                  CID: {uploadedCid}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => window.open(getGatewayUrl(uploadedCid), '_blank')}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View on IPFS
              </Button>
              <Button
                onClick={handleRemove}
                variant="outline"
                size="sm"
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
          >
            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

