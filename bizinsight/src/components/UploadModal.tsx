import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { UploadCloud, X, AlertTriangle, FileText, Database, Download } from 'lucide-react';
import { parseSalesCSV } from '../utils/csvParser';
import { SAMPLE_CSV_RAW } from '../data/sampleSalesData';
import { CSVParseResult } from '../types/analytics';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataLoaded: (result: CSVParseResult) => void;
  onLoadSample: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onDataLoaded,
  onLoadSample,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv' && file.type !== 'application/vnd.ms-excel') {
      setParseErrors(['Please upload a valid .csv format file.']);
      return;
    }

    setSelectedFileName(file.name);
    setParseErrors([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const result = parseSalesCSV(text, file.name);

      if (result.errors.length > 0) {
        setParseErrors(result.errors);
      } else {
        onDataLoaded(result);
        onClose();
      }
    };

    reader.onerror = () => {
      setParseErrors(['Failed to read the file. Please check file permissions and try again.']);
    };

    reader.readAsText(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleDownloadSample = () => {
    const blob = new Blob([SAMPLE_CSV_RAW], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_sales_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-left mb-4">
          <h3 className="text-lg font-bold text-slate-900">Upload Sales CSV</h3>
          <p className="text-xs text-slate-500 mt-1">
            Drop your sales dataset to analyze KPIs, trends, and generate executive AI insights.
          </p>
        </div>

        {/* Drag and drop zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/60'
              : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept=".csv,text/csv"
            className="hidden"
          />

          <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 mx-auto flex items-center justify-center mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>

          <p className="text-sm font-semibold text-slate-800">
            {selectedFileName ? selectedFileName : 'Drag & drop your CSV file here'}
          </p>
          <p className="text-xs text-slate-500 mt-1">or click to browse from your computer</p>

          <span className="inline-block mt-3 text-[11px] font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
            Supports standard CSV formatted files
          </span>
        </div>

        {/* Parse Errors display */}
        {parseErrors.length > 0 && (
          <div className="mt-4 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-rose-900 mb-1">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>CSV Validation Error</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-rose-700">
              {parseErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Expected columns guide */}
        <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600">
          <div className="font-semibold text-slate-800 flex items-center gap-1 mb-1">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Required CSV Columns:</span>
          </div>
          <div className="font-mono text-slate-700 flex flex-wrap gap-1 mt-1">
            <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">Order Date</span>
            <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">Region</span>
            <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">Category</span>
            <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">Product</span>
            <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">Sales</span>
            <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">Quantity</span>
            <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">Profit</span>
          </div>
        </div>

        {/* Quick Actions Footer */}
        <div className="mt-5 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleDownloadSample}
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Sample Template</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onLoadSample();
              onClose();
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-slate-600" />
            <span>Load Built-in Sample Dataset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
