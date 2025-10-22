
import React from 'react';
import Spinner from './Spinner';

interface ImageCardProps {
  title: string;
  imageUrl: string | null;
  isLoading: boolean;
  isGenerated?: boolean;
}

const ImageCard: React.FC<ImageCardProps> = ({ title, imageUrl, isLoading, isGenerated = false }) => {
  const mimeType = isGenerated ? 'image/jpeg' : 'image/png';
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col h-full">
      <h3 className="text-lg font-semibold text-center mb-4">{title}</h3>
      <div className="flex-grow flex items-center justify-center bg-gray-700/50 rounded-md min-h-[300px]">
        {isLoading ? (
          <Spinner />
        ) : imageUrl ? (
          <img
            src={`data:${mimeType};base64,${imageUrl}`}
            alt={title}
            className="max-w-full max-h-full object-contain rounded-md"
          />
        ) : (
          <div className="text-gray-500">
            {title === "Original" ? "Upload an image to begin" : "Result will be displayed here"}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageCard;
