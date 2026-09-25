import React, { useState, useRef } from 'react';
import { 
  Camera, 
  UploadCloud, 
  Trash2, 
  Plus, 
  AlertCircle, 
  Image as ImageIcon,
  ChevronLeft,
  ArrowRight,
  Info,
  Cpu,
} from 'lucide-react';
import { BatchData, Language } from '../types';
import { translations } from '../utils/translations';

interface ImageUploadProps {
  batch: BatchData;
  onAnalyze: (images: string[]) => void;
  onBack: () => void;
  language: Language;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  batch,
  onAnalyze,
  onBack,
  language,
}) => {
  const t = translations[language];

  // Default initial images
  const [images, setImages] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Compress/resize uploaded image using canvas to ensure low memory usage
  const processAndAddFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const isImage = validTypes.includes(file.type.toLowerCase()) || file.type.startsWith('image/');

    if (!isImage) {
      setError("Unsupported file format. Please upload JPG, PNG, or WebP images.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 900;
        const MAX_HEIGHT = 700;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setImages(prev => [...prev, compressedDataUrl]);
          setError(null);
        }
      };
      img.onerror = () => {
        setError("Failed to decode uploaded image. Please try another image file.");
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      setError("Failed to read file from disk.");
    };
    reader.readAsDataURL(file);
  };


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      Array.from(e.target.files).forEach(processAndAddFile);
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach(processAndAddFile);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleProceed = () => {
    if (images.length === 0) {
      setError(t.errorNoImages);
      return;
    }
    onAnalyze(images);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top back button and Batch indicator */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1c2a20] bg-white px-3.5 py-2 rounded-xl border border-[#cfcbb8] hover:bg-[#f1f6f0] transition-colors cursor-pointer shadow-xs"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Edit Batch Details</span>
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono font-bold bg-[#f1f6f0] text-[#174327] px-2.5 py-0.5 rounded-lg border border-[#cfcbb8]">
            {batch.batchId}
          </span>
          <span className="text-[#55665b] hidden sm:inline font-heading font-bold">
            {batch.onionVariety}
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-3xl border-2 border-[#1c5a35]/25 shadow-xl overflow-hidden">
        {/* Step Indicator Header */}
        <div className="bg-[#122e1d] text-[#f4f1e4] px-6 sm:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#24462f]">
          <div>
            <div className="text-[11px] font-extrabold text-[#f2c14e] uppercase tracking-wider font-heading">
              {t.stepIndicator}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mt-0.5 font-heading text-white">{t.uploadTitle}</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-[#174327] text-[#f2c14e] px-2.5 py-1 rounded-lg font-mono font-bold border border-[#24462f]">
              {images.length} {images.length === 1 ? 'Image' : 'Images'} Staged
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-3.5 bg-[#f6e5e1] border border-[#e5c1ba] rounded-2xl text-[#a93b2e] text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Active Model Engine Banner */}
          <div className="bg-[#f1f6f0] border border-[#bcd6c0] rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#1c5a35] text-white">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-[#174327]">Active Inference Engine: </span>
                <span className="font-semibold text-[#1c2a20]">
                  Roboflow YOLO11n Model (Server-Side Inference)
                </span>
                <p className="text-[11px] text-[#55665b]">
                  Uploaded photos are sent to Roboflow through the project backend.
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 font-mono font-bold text-[11px] bg-white px-2.5 py-1 rounded-lg border border-[#bcd6c0] text-[#1c5a35]">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
              REAL ROBOFLOW MODEL
            </span>
          </div>


          {/* Real uploads only: sample graphics do not represent inference inputs. */}
          <div className="bg-[#f6ecd4] border border-[#d9bf85] rounded-2xl p-4 text-xs text-[#55665b]">
            Upload or capture a real onion photo to run Roboflow inference. Synthetic test images are not accepted in this workflow.
          </div>

          {/* Upload / Drag & Drop Area */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center transition-all cursor-pointer ${
              dragOver
                ? 'border-[#1c5a35] bg-[#e0eee2]/50'
                : 'border-[#cfcbb8] hover:border-[#1c5a35] bg-[#f1f6f0]/40'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="max-w-md mx-auto space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[#e0eee2] text-[#1c5a35] flex items-center justify-center">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#1c2a20] font-heading">
                  {t.dragDropText}
                </p>
                <p className="text-xs text-[#55665b] mt-1">
                  Supports JPG, PNG, WEBP. You can select multiple images at once.
                </p>
              </div>

              {/* Camera Capture Button for Mobile */}
              <div className="pt-2 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    cameraInputRef.current?.click();
                  }}
                  className="inline-flex items-center gap-1.5 bg-[#122e1d] hover:bg-[#174327] text-[#f2c14e] px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <Camera className="w-4 h-4 text-[#f2c14e]" />
                  <span>{t.cameraButton}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Staged Image Previews */}
          {images.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-[#55665b] uppercase tracking-wider">
                <span>Staged Images for Individual Analysis ({images.length})</span>
                <button
                  onClick={() => setImages([])}
                  className="text-[#55665b] hover:text-[#a93b2e] transition cursor-pointer"
                >
                  {t.clearImages}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
                {images.map((src, index) => (
                  <div
                    key={index}
                    className="relative group rounded-2xl overflow-hidden border border-[#cfcbb8] bg-[#0b2013] aspect-square shadow-xs"
                  >
                    <img
                      src={src}
                      alt={`Onion specimen ${index + 1}`}
                      className="w-full h-full object-contain"
                    />

                    {/* Overlay badge */}
                    <div className="absolute top-2 left-2 bg-[#122e1d]/85 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                      Image {index + 1}
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 w-6 h-6 bg-[#a93b2e] hover:bg-[#c24535] text-white rounded-lg flex items-center justify-center transition shadow-md cursor-pointer opacity-90 group-hover:opacity-100"
                      title={t.remove}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {/* Add more button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#cfcbb8] hover:border-[#1c5a35] rounded-2xl aspect-square flex flex-col items-center justify-center gap-1 text-[#55665b] hover:text-[#174327] hover:bg-[#f1f6f0] transition cursor-pointer"
                >
                  <Plus className="w-5 h-5 text-[#55665b]" />
                  <span className="text-xs font-bold font-heading">Add More</span>
                </button>
              </div>
            </div>
          )}

          {/* Undersized reference scale requirement note */}
          <div className="bg-[#f7f5ee] border border-[#cfcbb8] rounded-2xl p-4 text-xs text-[#55665b] space-y-1">
            <div className="flex items-center gap-2 font-bold text-[#1c2a20]">
              <Info className="w-4 h-4 text-[#1c5a35] shrink-0" />
              <span>Undersized Classification Rule:</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              An onion is <strong>never</strong> classified as undersized simply because it appears small in the frame. A reliable size measurement requires a calibrated reference scale (coin, card, ruler, or standard tray grid). If no scale is detected, size category is reported as <em>"Size reference not detected"</em>.
            </p>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-[#e4e1d3] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#55665b] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1c5a35]" />
              <span>Real image scan: Sends each uploaded photo to Roboflow through the project backend.</span>
            </div>

            <button
              type="button"
              onClick={handleProceed}
              disabled={images.length === 0}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 font-bold px-8 py-3.5 rounded-xl transition shadow-md text-sm cursor-pointer active:scale-95 ${
                images.length > 0
                  ? 'bg-[#1c5a35] hover:bg-[#174327] text-white shadow-sm'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span>{images.length > 1 ? `Analyse ${images.length} Images` : 'Analyse Image'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};
