/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useCallback, useMemo } from 'react';
import { generateMakeoverImage, generateAdjustedImage, dataUrlToFile } from './services/geminiService';
import Header from './components/Header';
import Spinner from './components/Spinner';
import StartScreen from './components/StartScreen';
import { PlusIcon, MagicWandIcon, UndoIcon, RedoIcon, BullseyeIcon } from './components/icons';

// --- Component Definitions ---
// Defined in App.tsx to adhere to project structure constraints.

interface ImageSlotProps {
  imageFile: File | null;
  onImageSelect: (file: File) => void;
  onImageRemove: () => void;
  label: string;
  isMain?: boolean;
  isLoading: boolean;
  id: string;
}

const ImageSlot: React.FC<ImageSlotProps> = ({ imageFile, onImageSelect, onImageRemove, label, isMain = false, isLoading, id }) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  React.useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setObjectUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setObjectUrl(null);
  }, [imageFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelect(e.target.files[0]);
    }
  };

  return (
    <div className={`relative aspect-square w-full rounded-lg transition-all duration-300 group ${isMain ? 'bg-gray-800/60' : 'bg-gray-800/40'} ${imageFile ? '' : 'border-2 border-dashed border-gray-600 hover:border-yellow-500 hover:bg-yellow-500/10'}`}>
      <input type="file" id={id} className="hidden" accept="image/*" onChange={handleFileChange} disabled={isLoading} />
      {objectUrl ? (
        <>
          <img src={objectUrl} alt={label} className="w-full h-full object-cover rounded-lg" />
          {/* Overlay to show filename on hover */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <p className="text-white text-xs truncate" title={imageFile?.name}>{imageFile?.name}</p>
          </div>
          <button
            onClick={onImageRemove}
            disabled={isLoading}
            className="absolute top-2 right-2 z-10 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-all duration-200 opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={`Remove ${label}`}
          >
            &#x2715;
          </button>
        </>
      ) : (
        <label htmlFor={id} className={`w-full h-full flex flex-col items-center justify-center text-center p-2 cursor-pointer ${isLoading ? 'cursor-not-allowed' : ''}`}>
          <PlusIcon className="w-8 h-8 text-gray-500 group-hover:text-yellow-400 transition-colors" />
          <span className={`mt-2 font-semibold ${isMain ? 'text-md' : 'text-sm'} text-gray-400 group-hover:text-yellow-400 transition-colors`}>{label}</span>
        </label>
      )}
    </div>
  );
};


interface GenerativeEditPanelProps {
  onApplyEdit: (prompt: string) => void;
  isLoading: boolean;
}

const GenerativeEditPanel: React.FC<GenerativeEditPanelProps> = ({ onApplyEdit, isLoading }) => {
  const [prompt, setPrompt] = useState('');

  const handleApply = () => {
    if (prompt.trim()) {
      onApplyEdit(prompt);
      setPrompt(''); // Clear prompt after applying
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading && prompt.trim()) {
        handleApply();
    }
  };

  return (
    <div className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex flex-col gap-4 animate-fade-in backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-center text-gray-300">Make Further Adjustments</h3>
      
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe an edit (e.g., 'make the lighting more dramatic')"
          className="flex-grow bg-gray-800 border border-gray-600 text-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-yellow-500 focus:outline-none transition w-full disabled:cursor-not-allowed disabled:opacity-60 text-base"
          disabled={isLoading}
        />
        <button
          onClick={handleApply}
          className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-black font-bold py-4 px-8 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-yellow-500/20 hover:shadow-xl hover:shadow-yellow-400/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base disabled:from-gray-600 disabled:to-gray-500 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
          disabled={isLoading || !prompt.trim()}
        >
          Apply
        </button>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const [inputImages, setInputImages] = useState<(File | null)[]>(new Array(7).fill(null));
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState<boolean>(false);

  const mainPortrait = useMemo(() => inputImages[0], [inputImages]);
  const styleElementImages = useMemo(() => inputImages.slice(1, 6), [inputImages]);
  const vibeImage = useMemo(() => inputImages[6], [inputImages]);
  const hasUploadedImages = useMemo(() => inputImages.some(img => img !== null), [inputImages]);
  const currentGeneratedImage = useMemo(() => history[historyIndex] ?? null, [history, historyIndex]);

  const handleInitialUpload = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    setHistory([]);
    setHistoryIndex(-1);
    setIsDirty(false);
    const newImages = new Array(7).fill(null);
    for (let i = 0; i < Math.min(files.length, 7); i++) {
        newImages[i] = files[i];
    }
    setInputImages(newImages);
  }, []);

  const handleSlotUpdate = useCallback((file: File, index: number) => {
    setInputImages(currentImages => {
      const newImages = [...currentImages];
      newImages[index] = file;
      return newImages;
    });
    setIsDirty(true);
  }, []);

  const handleSlotRemove = useCallback((index: number) => {
    setInputImages(currentImages => {
      const newImages = [...currentImages];
      newImages[index] = null;
      return newImages;
    });
    setIsDirty(true);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!mainPortrait) {
      setError('Please provide a main portrait image to start the makeover.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setHistory([]);
    setHistoryIndex(-1);
    setIsDirty(false);
    
    try {
        const resultImageUrl = await generateMakeoverImage(mainPortrait, styleElementImages, vibeImage);
        setHistory([resultImageUrl]);
        setHistoryIndex(0);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Failed to generate the makeover. ${errorMessage}`);
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  }, [mainPortrait, styleElementImages, vibeImage]);

  const handleApplyEdit = useCallback(async (prompt: string) => {
      if (!currentGeneratedImage) return;
      setIsLoading(true);
      setError(null);
      try {
          const currentImageFile = await dataUrlToFile(currentGeneratedImage, `edit-source-${Date.now()}.png`);
          const newImageUrl = await generateAdjustedImage(currentImageFile, prompt);
          const newHistory = history.slice(0, historyIndex + 1);
          setHistory([...newHistory, newImageUrl]);
          setHistoryIndex(newHistory.length);
      } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
          setError(`Failed to apply edit. ${errorMessage}`);
          console.error(err);
      } finally {
          setIsLoading(false);
      }
  }, [currentGeneratedImage, history, historyIndex]);
  
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
    }
  }, [historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
    }
  }, [history, historyIndex]);

  const handleStartOver = useCallback(() => {
    setInputImages(new Array(7).fill(null));
    setHistory([]);
    setHistoryIndex(-1);
    setError(null);
    setIsLoading(false);
    setIsDirty(false);
  }, []);

  const handleDownload = useCallback(() => {
    if (currentGeneratedImage) {
        const link = document.createElement('a');
        link.href = currentGeneratedImage;
        link.download = `makeover-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  }, [currentGeneratedImage]);

  const handleUseAsVibe = useCallback(async () => {
    if (!currentGeneratedImage) return;

    setIsLoading(true);
    setError(null);

    try {
        const vibeFile = await dataUrlToFile(currentGeneratedImage, `vibe-from-generated-${Date.now()}.png`);
        
        setInputImages(currentImages => {
            const newImages = new Array(7).fill(null);
            newImages[0] = currentImages[0]; // Keep the main portrait
            // Style elements at indices 1-5 are cleared by the fill(null) above
            newImages[6] = vibeFile; // Set the new vibe image from the generated result
            return newImages;
        });

        // Reset the generation state to show the main "Generate" button again
        setHistory([]);
        setHistoryIndex(-1);
        setIsDirty(false);

    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Failed to set up refinement. ${errorMessage}`);
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  }, [currentGeneratedImage]);

  const renderContent = () => {
    if (error) {
       return (
           <div className="text-center animate-fade-in bg-amber-500/10 border border-amber-500/20 p-8 rounded-lg max-w-2xl mx-auto flex flex-col items-center gap-4">
            <h2 className="text-2xl font-bold text-amber-300">An Error Occurred</h2>
            <p className="text-md text-amber-400">{error}</p>
            <button
                onClick={() => setError(null)}
                className="bg-amber-500 hover:bg-amber-600 text-black font-bold py-2 px-6 rounded-lg text-md transition-colors"
              >
                Try Again
            </button>
          </div>
        );
    }
    
    if (!hasUploadedImages) {
      return <StartScreen onFileSelect={handleInitialUpload} />;
    }
    
    return (
      <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Column: Main Portrait */}
          <div className="lg:col-span-1 flex flex-col items-center gap-2">
              <h2 className="text-lg font-bold text-gray-200">Main Portrait</h2>
              <p className="text-sm text-gray-500 -mt-2 mb-2 text-center">The person to give a makeover to.</p>
              <ImageSlot
                  imageFile={mainPortrait}
                  onImageSelect={(file) => handleSlotUpdate(file, 0)}
                  onImageRemove={() => handleSlotRemove(0)}
                  label="Face / Portrait*"
                  isMain
                  isLoading={isLoading}
                  id="upload-main"
              />
              <div className="mt-4 w-full bg-gray-800/40 border border-gray-700/60 rounded-lg p-3 text-center animate-fade-in">
                  <h3 className="font-semibold text-yellow-400 mb-1">Pro Tip</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                      Change the portrait, elements, or vibe images and click "Regenerate" to try a new look! For best results, use clear, high-quality images.
                  </p>
              </div>
              <div className="mt-2 w-full bg-gray-800/40 border border-gray-700/60 rounded-lg p-3 text-center animate-fade-in">
                  <h3 className="font-semibold text-yellow-400 mb-1">Pro Tip</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                      Result not quite right? Use the "Refine with this Vibe" button to use your generated image as a new reference. This helps the AI get closer to your desired look.
                  </p>
              </div>
          </div>

          {/* Center Column: Generation Area */}
          <div className="lg:col-span-3 flex flex-col items-center justify-center bg-gray-900/50 border border-gray-700 rounded-2xl p-4 min-h-[400px] lg:min-h-0 shadow-2xl generation-container">
              {isLoading && !currentGeneratedImage ? (
                  <div className="flex flex-col items-center justify-center gap-4 animate-fade-in">
                      <Spinner />
                      <p className="text-gray-300">AI is creating your new look...</p>
                  </div>
              ) : currentGeneratedImage ? (
                  <div className="w-full h-full flex flex-col gap-4">
                      <div className="relative flex-grow min-h-0">
                          <img src={currentGeneratedImage} alt="Generated Makeover" className="w-full h-full object-contain rounded-lg" />
                          {isLoading && (
                              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-lg animate-fade-in">
                                  <Spinner />
                                  <p className="mt-4 text-gray-300">Applying edit...</p>
                              </div>
                          )}
                      </div>
                      <GenerativeEditPanel onApplyEdit={handleApplyEdit} isLoading={isLoading} />
                  </div>
              ) : (
                  <div className="text-center flex flex-col items-center gap-4 p-4">
                      <div className="w-20 h-20 bg-yellow-400/10 border-2 border-dashed border-yellow-400/30 rounded-full flex items-center justify-center">
                          <MagicWandIcon className="w-10 h-10 text-yellow-400" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-200">Ready for a New Look?</h2>
                      <p className="text-gray-400 max-w-sm">
                          Add a main portrait and style elements, then click the generate button below.
                          The AI will combine them into a brand new image!
                      </p>
                      <button
                          onClick={handleGenerate}
                          disabled={isLoading || !mainPortrait}
                          className="mt-4 bg-gradient-to-br from-yellow-400 to-yellow-500 text-black font-bold py-4 px-10 text-lg rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-yellow-500/20 hover:shadow-xl hover:shadow-yellow-400/40 hover:-translate-y-px active:scale-95 active:shadow-inner disabled:from-gray-600 disabled:to-gray-500 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
                      >
                          Generate Makeover
                      </button>
                  </div>
              )}
          </div>

          {/* Right Column: Style & Vibe */}
          <div className="lg:col-span-1 flex flex-col items-center gap-4">
              <div>
                  <h2 className="text-lg font-bold text-gray-200 text-center">Style Elements</h2>
                  <p className="text-sm text-gray-500 -mt-1 mb-2 text-center">Add clothes, accessories etc.</p>
                  <div className="w-full grid grid-cols-2 gap-3">
                      {styleElementImages.map((img, index) => (
                          <ImageSlot
                              key={`element-${index}`}
                              imageFile={img}
                              onImageSelect={(file) => handleSlotUpdate(file, index + 1)}
                              onImageRemove={() => handleSlotRemove(index + 1)}
                              label={`Element ${index + 1}`}
                              isLoading={isLoading}
                              id={`upload-element-${index + 1}`}
                          />
                      ))}
                  </div>
              </div>
              <div className="w-full">
                  <h2 className="text-lg font-bold text-gray-200 text-center mt-2">Vibe / Reference</h2>
                  <p className="text-sm text-gray-500 -mt-1 mb-2 text-center">Optional style or mood reference.</p>
                  <ImageSlot
                      imageFile={vibeImage}
                      onImageSelect={(file) => handleSlotUpdate(file, 6)}
                      onImageRemove={() => handleSlotRemove(6)}
                      label="Vibe Image"
                      isLoading={isLoading}
                      id="upload-vibe"
                  />
              </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-4 bg-gray-800/80 border border-gray-700/80 rounded-lg p-4 backdrop-blur-sm">
            <button 
                onClick={handleStartOver}
                className="text-center bg-white/10 border border-white/20 text-gray-200 font-semibold py-3 px-5 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 hover:border-white/30 active:scale-95 text-base"
            >
                Start Over
            </button>

            {currentGeneratedImage && isDirty && (
              <button
                onClick={handleGenerate}
                disabled={isLoading || !mainPortrait}
                className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-black font-bold py-3 px-5 rounded-md transition-all duration-300 ease-in-out shadow-lg shadow-yellow-500/20 hover:shadow-xl hover:shadow-yellow-400/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base disabled:from-gray-600 disabled:to-gray-500 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none animate-fade-in"
              >
                Regenerate Makeover
              </button>
            )}

            {currentGeneratedImage && (
              <button
                onClick={handleUseAsVibe}
                disabled={isLoading}
                className="flex items-center justify-center text-center bg-white/10 border border-white/20 text-gray-200 font-semibold py-3 px-5 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 hover:border-white/30 active:scale-95 text-base disabled:opacity-50 disabled:cursor-not-allowed animate-fade-in"
                title="Use this result as the new Vibe/Reference image and clear all style elements to refine the look."
              >
                <BullseyeIcon className="w-5 h-5 mr-2" />
                Refine with this Vibe
              </button>
            )}

            {currentGeneratedImage && (
              <div className="flex items-center gap-2">
                  <button
                      onClick={handleUndo}
                      disabled={historyIndex <= 0 || isLoading}
                      className="p-3 bg-white/10 border border-white/20 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
                      aria-label="Undo"
                  >
                      <UndoIcon className="w-6 h-6 text-gray-200" />
                  </button>
                  <button
                      onClick={handleRedo}
                      disabled={historyIndex >= history.length - 1 || isLoading}
                      className="p-3 bg-white/10 border border-white/20 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
                      aria-label="Redo"
                  >
                      <RedoIcon className="w-6 h-6 text-gray-200" />
                  </button>
              </div>
            )}

            <div className="flex-grow"></div>

            <button 
                onClick={handleDownload}
                disabled={!currentGeneratedImage || isLoading}
                className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-black font-bold py-3 px-5 rounded-md transition-all duration-300 ease-in-out shadow-lg shadow-yellow-500/20 hover:shadow-xl hover:shadow-yellow-400/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base disabled:from-gray-600 disabled:to-gray-500 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
            >
                Download Image
            </button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen text-gray-100 flex flex-col">
      <Header />
      <main className={`flex-grow w-full max-w-[1600px] mx-auto p-4 md:p-8 flex justify-center ${hasUploadedImages ? 'items-start' : 'items-center'}`}>
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
