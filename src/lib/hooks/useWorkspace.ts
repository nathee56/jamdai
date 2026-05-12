'use client';

import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import * as pdfjs from 'pdfjs-dist';

// Set worker for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.js`;

export interface WorkspaceFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  iconLink: string;
  modifiedTime: string;
}

export function useWorkspace() {
  const [files, setFiles] = useState<WorkspaceFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listFiles = useCallback(async (folderId: string = 'root') => {
    // Google Drive integration is currently disabled
    setFiles([]);
    setLoading(false);
  }, []);

  const fetchRecentFiles = useCallback(async () => {
    // Google Drive integration is currently disabled
    setFiles([]);
    setLoading(false);
  }, []);

  const fetchFileContent = useCallback(async (fileId: string, mimeType: string) => {
    throw new Error('การเชื่อมต่อกับ Google Drive ถูกยกเลิกชั่วคราว');
  }, []);

  return { files, loading, error, fetchRecentFiles, fetchFileContent, listFiles };
}

