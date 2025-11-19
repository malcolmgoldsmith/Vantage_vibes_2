import React from 'react';
import { Trash2 } from 'lucide-react';

interface AppCardProps {
  name: string;
  description: string;
  icon: string;
  color: string;
  onClick?: () => void;
  onDelete?: () => void;
}
export const AppCard: React.FC<AppCardProps> = ({
  name,
  description,
  icon,
  onClick,
  onDelete
}) => {
  return <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors border border-gray-200 relative group">
      <div onClick={onClick} className="cursor-pointer">
        <div className="flex items-start">
          <div className="w-16 h-16 flex items-center justify-center mr-3 flex-shrink-0">
            <img src={icon} alt={name} className="w-full h-full object-contain" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-sm mb-1">{name}</h4>
            <p className="text-xs text-gray-600">{description}</p>
          </div>
        </div>
      </div>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
          title="Delete app"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>;
};