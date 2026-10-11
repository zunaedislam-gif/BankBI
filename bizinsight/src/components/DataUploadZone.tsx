import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { UploadCloud, Database, AlertCircle, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import { parseSalesCSV } from '../utils/csvParser';
import { CSVParseResult } from '../types/analytics';

interface DataUploadZoneProps {
  onDataLoaded: (result: CSVParseResult) => void;
  onLoadSample: () => void;
  currentFileName: string;
  totalRecords: number;
}

export const DataUploadZone: React.FC<DataUploadZoneProps> = ({
  onDataLoaded,
  onLoadSample,
  currentFileName,
  totalRecords,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv' && file.type !== 'application/vnd.ms-excel') {
      setErrorMessages(['Only .csv format files are supported.']);
      setSuccessNotice(null);
      return;
    }

    setErrorMessages([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const result = parseSalesCSV(text, file.name);

      if (result.errors.length > 0) {
        setErrorMessages(result.errors);
        setSuccessNotice(null);
      } else {
        onDataLoaded(result);
        setSuccessNotice(`Successfully loaded "${file.name}" with ${result.rowCount} records.`);
        setTimeout(() => setSuccessNotice(null), 4000);
      }
    };

    reader.onerror = () => {
      setErrorMessages(['Failed to read file. Please try again.']);
      setSuccessNotice(null);
    };

    reader.readAsText(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left: Drag and drop dropzone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex-1 border-2 border-dashed rounded-lg p-4 sm:p-5 flex items-center gap-4 cursor-pointer transition-all ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/70'
              : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInput}
            accept=".csv,text/csv"
            className="hidden"
          />

          <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <UploadCloud className="w-5 h-5" />
          </div>

          <div className="text-left">
            <p className="text-xs sm:text-sm font-semibold text-slate-800">
              Drop your sales CSV file here, or{' '}
              <span className="text-indigo-600 underline font-medium">browse</span>
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Requires columns: Order Date, Region, Category, Product, Sales, Quantity, Profit
            </p>
          </div>
        </div>

        {/* Right: Quick actions & current file status */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <div className="hidden xl:flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <FileSpreadsheet className="w-4 h-4 text-slate-500 shrink-0" />
            <div className="text-left">
              <span className="block font-medium text-slate-800 max-w-[140px] truncate">
                {currentFileName}
              </span>
              <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                {totalRecords} rows loaded
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onLoadSample}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300/80 rounded-lg transition-colors cursor-pointer"
          >
            <Database className="w-4 h-4 text-slate-600" />
            <span>Load Sample Data</span>
          </button>
        </div>
      </div>

      {/* Errors alert */}
      {errorMessages.length > 0 && (
        <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold">CSV Upload Error:</span>
            {errorMessages.map((msg, i) => (
              <p key={i} className="text-rose-700">
                {msg}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Success alert */}
      {successNotice && (
        <div className="mt-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}
    </div>
  );
};
