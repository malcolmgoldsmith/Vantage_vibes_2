import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
export const VirtualAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  return <div className="fixed bottom-0 right-8 flex flex-col items-end">
      {/* Blue assistant button */}
      <button className="bg-blue-600 text-white rounded-t-2xl px-6 py-3 shadow-lg hover:bg-blue-700 transition-colors flex items-center space-x-3 relative" onClick={() => setIsOpen(!isOpen)}>
        <span className="font-medium whitespace-nowrap">
          Lena Virtual Assistant
        </span>
        <div className="bg-white rounded-full p-1.5 flex items-center justify-center">
          <MessageCircle size={20} className="text-blue-600" />
        </div>
      </button>
      {isOpen && <div className="absolute bottom-20 right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden mb-2">
          <div className="bg-blue-600 text-white p-4">
            <h3 className="font-medium">Lena Virtual Assistant</h3>
          </div>
          <div className="p-4 h-80 overflow-y-auto">
            <div className="bg-gray-100 rounded-lg p-3 mb-3 max-w-[80%]">
              <p className="text-sm">How can I help you today?</p>
            </div>
            <div className="flex justify-end">
              <div className="bg-blue-600 text-white rounded-lg p-3 mb-3 max-w-[80%]">
                <p className="text-sm">I need help with my battery.</p>
              </div>
            </div>
            <div className="bg-gray-100 rounded-lg p-3 mb-3 max-w-[80%]">
              <p className="text-sm">
                I can help with battery issues. Your battery is currently at 82%
                and charging. Is there a specific concern?
              </p>
            </div>
          </div>
          <div className="p-3 border-t border-gray-200">
            <div className="relative">
              <input type="text" className="w-full border border-gray-300 rounded-full py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Type a message..." />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
          </div>
        </div>}
    </div>;
};