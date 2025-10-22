
import React, { useState, useCallback, ChangeEvent } from 'react';
import { generateImage, restorePhoto } from './services/geminiService';
import { AspectRatio } from './types';
import ImageCard from './components/ImageCard';

const fileToBase64 = (file: File): Promise<{ base64: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const [mimeString, base64] = result.split(',');
            const mimeType = mimeString.match(/:(.*?);/)?.[1] || 'application/octet-stream';
            resolve({ base64, mimeType });
        };
        reader.onerror = (error) => reject(error);
    });
};


const App: React.FC = () => {
  // Restoration state
  const [originalImage, setOriginalImage] = useState<{ base64: string; mimeType: string } | null>(null);
  const [restoredImage, setRestoredImage] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const [restorationError, setRestorationError] = useState<string | null>(null);

  // Generation state
  const [prompt, setPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.SQUARE);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setRestoredImage(null);
      setRestorationError(null);
      try {
        const { base64, mimeType } = await fileToBase64(file);
        setOriginalImage({ base64, mimeType });
      } catch (error) {
        setRestorationError("Failed to read the image file.");
        console.error(error);
      }
    }
  };

  const handleRestore = useCallback(async () => {
    if (!originalImage) return;
    setIsRestoring(true);
    setRestoredImage(null);
    setRestorationError(null);
    try {
      const restored = await restorePhoto(originalImage.base64, originalImage.mimeType);
      setRestoredImage(restored);
    } catch (error: any) {
      setRestorationError(error.message || "An unexpected error occurred during restoration.");
      console.error(error);
    } finally {
      setIsRestoring(false);
    }
  }, [originalImage]);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setGeneratedImage(null);
    setGenerationError(null);
    try {
      const generated = await generateImage(prompt, aspectRatio);
      setGeneratedImage(generated);
    } catch (error: any) {
      setGenerationError(error.message || "An unexpected error occurred during generation.");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, aspectRatio]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            AI Photo Enhancer
          </h1>
          <p className="mt-4 text-lg text-gray-400">Restore old memories and create new visions with Gemini.</p>
        </header>

        <main className="space-y-16">
          {/* Photo Restoration Section */}
          <section className="bg-gray-900/50 rounded-xl p-6 md:p-8 shadow-2xl border border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-center text-blue-300">Photo Restoration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="flex flex-col gap-6 items-center">
                <label htmlFor="file-upload" className="cursor-pointer w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 shadow-lg">
                  {originalImage ? 'Change Image' : 'Upload an Old Photo'}
                </label>
                <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                <button
                  onClick={handleRestore}
                  disabled={!originalImage || isRestoring}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                >
                  {isRestoring ? 'Restoring...' : 'Restore Photo'}
                </button>
                {restorationError && <p className="text-red-400 text-sm mt-2">{restorationError}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ImageCard title="Original" imageUrl={originalImage?.base64 || null} isLoading={false} />
                  <ImageCard title="Restored" imageUrl={restoredImage} isLoading={isRestoring} />
              </div>
            </div>
          </section>

          {/* Image Generation Section */}
          <section className="bg-gray-900/50 rounded-xl p-6 md:p-8 shadow-2xl border border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-center text-purple-300">Image Generation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="flex flex-col gap-6">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., A futuristic city skyline at sunset, cyberpunk style..."
                  className="w-full h-32 p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                />
                
                <div>
                  <label htmlFor="aspect-ratio" className="block text-sm font-medium text-gray-300 mb-2">Aspect Ratio</label>
                  <select
                    id="aspect-ratio"
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                  >
                    {Object.values(AspectRatio).map(ratio => (
                      <option key={ratio} value={ratio}>{ratio}</option>
                    ))}
                  </select>
                </div>
                
                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                >
                  {isGenerating ? 'Generating...' : 'Generate Image'}
                </button>
                {generationError && <p className="text-red-400 text-sm mt-2">{generationError}</p>}
              </div>
              <ImageCard title="Generated" imageUrl={generatedImage} isLoading={isGenerating} isGenerated={true} />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default App;

