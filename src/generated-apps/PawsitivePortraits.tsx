import React, { useState, useRef } from 'react';

// Built-in Gemini Image Generator Hook
const useImageGenerator = () => {
  const [images, setImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  // Helper function to convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]); // Remove data URI prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Generate new image from text prompt (text-to-image)
  const generate = async (key: string, prompt: string, aspectRatio: '1:1' | '16:9' | '9:16' | '2:3' | '3:2' | '3:4' | '4:3' | '4:5' | '5:4' | '21:9' = '16:9') => {
    setLoading(prev => ({ ...prev, [key]: true }));
    try {
      const response = await fetch('http://localhost:3001/api/gemini/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, aspectRatio })
      });
      const data = await response.json();
      if (data.success) {
        setImages(prev => ({ ...prev, [key]: data.imageUrl }));
        return data.imageUrl;
      }
    } catch (error) {
      console.error('Image generation failed:', error);
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
    return null;
  };

  // Edit existing image with text prompt (image-to-image)
  const editImage = async (key: string, prompt: string, inputImageBase64: string) => {
    setLoading(prev => ({ ...prev, [key]: true }));
    try {
      const response = await fetch('http://localhost:3001/api/gemini/edit-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, inputImage: inputImageBase64 })
      });
      const data = await response.json();
      if (data.success) {
        setImages(prev => ({ ...prev, [key]: data.imageUrl }));
        return data.imageUrl;
      }
    } catch (error) {
      console.error('Image editing failed:', error);
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
    return null;
  };

  return { images, loading, generate, editImage, fileToBase64 };
};

export const PawsitivePortraits: React.FC = () => {
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { images, loading, editImage, fileToBase64 } = useImageGenerator();

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleTransform = async () => {
    if (!uploadedImage) return;
    const base64Data = uploadedImage.split(',')[1];
    await editImage('transformed', 'Transform this pet into a professional outdoor portrait with natural lighting. The pet should be wearing a stylish, realistic puffer jacket in an authentic outdoor setting with natural colors, photorealistic details, and lifelike quality', base64Data);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full h-full flex flex-col p-6 bg-gradient-to-br from-[#FAF9F6] to-[#E8F5F1] overflow-auto">
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 flex-1">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-gray-800 mb-2">Pawsitive Portraits</h1>
          <p className="text-base text-gray-600">Transform your pet into whimsical outdoor art</p>
        </div>

        {!uploadedImage && !images.transformed && (
          <div className="flex-1 flex items-center justify-center">
            <div
              className={`w-full max-w-md p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 ${
                isDragging
                  ? 'border-[#FF6B6B] border-solid bg-[#FF6B6B]/5'
                  : 'border-gray-300 hover:border-[#FF6B6B] hover:border-solid bg-white'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleUploadClick}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-4 text-center">
                <svg className="w-16 h-16 text-[#95E1D3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">Upload Your Pet Photo</h2>
                  <p className="text-base text-gray-600">Drag and drop or click to browse</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {uploadedImage && (
          <div className="flex-1 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-3">
                <h2 className="text-2xl font-semibold text-gray-800">Original</h2>
                <div className="bg-white rounded-2xl p-4 shadow-lg">
                  <img src={uploadedImage} alt="Uploaded pet" className="w-full h-auto rounded-lg" />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <h2 className="text-2xl font-semibold text-gray-800">Transformed</h2>
                <div className="bg-white rounded-2xl p-4 shadow-lg min-h-[300px] flex items-center justify-center">
                  {loading.transformed && (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-[#FF6B6B] border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-base text-gray-600">Creating your whimsical portrait...</p>
                    </div>
                  )}
                  {images.transformed && !loading.transformed && (
                    <img src={images.transformed} alt="Transformed pet" className="w-full h-auto rounded-lg animate-[fadeIn_400ms_ease-in]" />
                  )}
                  {!images.transformed && !loading.transformed && (
                    <p className="text-base text-gray-400">Click Transform to see the magic!</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              {!images.transformed && !loading.transformed && (
                <button
                  onClick={handleTransform}
                  className="px-8 py-4 bg-[#FF6B6B] text-white text-base font-semibold rounded-xl shadow-md hover:scale-105 transition-transform duration-200 hover:shadow-lg"
                >
                  Transform
                </button>
              )}
              {images.transformed && (
                <button
                  onClick={() => {
                    setUploadedImage('');
                  }}
                  className="px-8 py-4 bg-[#95E1D3] text-gray-800 text-base font-semibold rounded-xl shadow-md hover:scale-105 transition-transform duration-200 hover:shadow-lg"
                >
                  Upload New Photo
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};