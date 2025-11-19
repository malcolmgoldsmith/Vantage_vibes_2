import React, { useState, useRef } from 'react';

export const PetPuffer: React.FC = () => {
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size must be less than 10MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setGeneratedImage('');
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!uploadedImage) {
      setError('Please upload an image first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Extract base64 data from data URI (remove "data:image/...;base64," prefix)
      const base64Data = uploadedImage.split(',')[1];

      // Call edit-image endpoint to modify the uploaded image
      const response = await fetch('http://localhost:3001/api/gemini/edit-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Add a stylish puffer jacket to this pet. The pet should be wearing a cozy, puffy winter jacket. Keep the pet exactly as it is, just add the puffer jacket clothing. High quality photo.',
          inputImage: base64Data
        })
      });

      const data = await response.json();

      if (data.success && data.imageUrl) {
        setGeneratedImage(data.imageUrl);
      } else {
        setError('Failed to edit image. Please try again.');
      }
    } catch (err) {
      setError('An error occurred while editing the image');
      console.error('Edit error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    setUploadedImage('');
    setGeneratedImage('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-6 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Pet Puffer Generator</h2>
        <p className="text-sm text-gray-600">Upload your pet's photo and see them in a stylish puffer jacket!</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex-1 flex gap-4 min-h-0">
        <div className="flex-1 flex flex-col">
          <div className="flex-1 bg-white rounded-lg shadow-md p-4 flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
            {uploadedImage ? (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <img src={uploadedImage} alt="Uploaded pet" className="max-w-full max-h-full object-contain rounded-lg" />
              </div>
            ) : (
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="text-gray-600 text-sm">Upload your pet's photo</p>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">Original Photo</p>
        </div>

        <div className="flex flex-col justify-center">
          <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex-1 bg-white rounded-lg shadow-md p-4 flex flex-col items-center justify-center border-2 border-purple-300">
            {loading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-sm">Generating your pet in a puffer jacket...</p>
              </div>
            ) : generatedImage ? (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <img src={generatedImage} alt="Pet with puffer jacket" className="max-w-full max-h-full object-contain rounded-lg" />
              </div>
            ) : (
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-purple-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-400 text-sm">Generated image will appear here</p>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">Pet with Puffer Jacket</p>
        </div>
      </div>

      <div className="mt-6 flex gap-3 justify-center">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <button
          onClick={handleUploadClick}
          className="px-6 py-2 bg-white border-2 border-purple-500 text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-colors shadow-sm"
        >
          Upload Photo
        </button>
        <button
          onClick={handleGenerate}
          disabled={!uploadedImage || loading}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm"
        >
          {loading ? 'Generating...' : 'Generate Puffer Look'}
        </button>
        {(uploadedImage || generatedImage) && (
          <button
            onClick={handleReset}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors shadow-sm"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
};