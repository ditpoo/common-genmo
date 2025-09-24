/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { UploadIcon, MagicWandIcon, PaletteIcon, SunIcon } from './icons';

interface StartScreenProps {
  onFileSelect: (files: FileList | null) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onFileSelect }) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileSelect(e.target.files);
  };

  return (
    <div 
      className={`w-full max-w-5xl mx-auto text-center p-8 transition-all duration-300 rounded-2xl border-2 ${isDraggingOver ? 'bg-yellow-500/10 border-dashed border-yellow-400' : 'border-transparent'}`}
      onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
      onDragLeave={() => setIsDraggingOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDraggingOver(false);
        onFileSelect(e.dataTransfer.files);
      }}
    >
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-100 sm:text-6xl md:text-7xl">
          AI-Powered Make Over, <span className="text-yellow-400">Switch It Up.</span>
        </h1>
        <p className="max-w-2xl text-lg text-gray-400 md:text-xl">
          Get a professional make over by combining a portrait with style elements from other images. No complex tools needed.
        </p>

        <div className="mt-6 flex flex-col items-center gap-4">
            <div className="mb-2 text-gray-300 max-w-lg mx-auto">
                <p>Upload up to 7 images to get started:</p>
                <p className="text-sm">1 face/portrait<span className="font-semibold text-yellow-400">*</span>, up to 5 style elements (clothes, accessories), and 1 optional vibe/reference image.</p>
            </div>
            <label htmlFor="image-upload-start" className="relative inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-black bg-yellow-400 rounded-full cursor-pointer group hover:bg-yellow-500 transition-colors">
                <UploadIcon className="w-6 h-6 mr-3 transition-transform duration-500 ease-in-out group-hover:rotate-[360deg] group-hover:scale-110" />
                Upload Images
            </label>
            <input id="image-upload-start" type="file" className="hidden" accept="image/*" multiple onChange={handleFileChange} />
            <p className="text-sm text-gray-500">or drag and drop files</p>
        </div>

        <div className="mt-16 w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-black/20 p-6 rounded-lg border border-gray-700/50 flex flex-col items-center text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-gray-700 rounded-full mb-4">
                       <MagicWandIcon className="w-6 h-6 text-yellow-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-100">Combine & Create</h3>
                    <p className="mt-2 text-gray-400">Mix a main portrait with style elements from other photos to generate a completely new, stylized image.</p>
                </div>
                <div className="bg-black/20 p-6 rounded-lg border border-gray-700/50 flex flex-col items-center text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-gray-700 rounded-full mb-4">
                       <PaletteIcon className="w-6 h-6 text-yellow-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-100">Intelligent Styling</h3>
                    <p className="mt-2 text-gray-400">The AI understands fashion, intelligently applying clothing, accessories, and makeup to fit your subject.</p>
                </div>
                <div className="bg-black/20 p-6 rounded-lg border border-gray-700/50 flex flex-col items-center text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-gray-700 rounded-full mb-4">
                       <SunIcon className="w-6 h-6 text-yellow-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-100">Photorealistic Results</h3>
                    <p className="mt-2 text-gray-400">Get high-quality, professional results that preserve your subject's identity while transforming their style.</p>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default StartScreen;