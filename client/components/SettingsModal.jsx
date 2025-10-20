import React, { useState, useEffect } from "react";
import { X, Settings } from "react-feather";

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  isSessionActive, 
  sendClientEvent 
}) {
  const [customInstructions, setCustomInstructions] = useState('');

  // Load from localStorage on mount
  useEffect(() => {
    const savedInstructions = localStorage.getItem('customInstructions');
    if (savedInstructions) {
      setCustomInstructions(savedInstructions);
    }
  }, []);

  const handleInstructionsChange = (event) => {
    const newInstructions = event.target.value;
    setCustomInstructions(newInstructions);
    localStorage.setItem('customInstructions', newInstructions);
  };

  const applyInstructions = () => {
    if (customInstructions.trim()) {
      sendClientEvent({
        type: "session.update",
        session: {
          instructions: customInstructions,
        },
      });
      console.log('[instructions] Applied:', customInstructions);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Settings height={20} />
            <h2 className="text-lg font-bold">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md"
          >
            <X height={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Custom Instructions Section */}
          <div className="mb-6">
            <h3 className="text-md font-semibold mb-2">Custom Instructions</h3>
            <p className="text-sm text-gray-600 mb-3">
              Define system prompts and behavior for the AI. These instructions apply to all conversations.
            </p>
            <textarea
              value={customInstructions}
              onChange={handleInstructionsChange}
              placeholder="Example: You are a helpful trading assistant specializing in F&O strategies. Always provide risk assessments and real-world examples. Keep responses concise and actionable."
              className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[150px] resize-y"
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500">
                {isSessionActive 
                  ? "Click 'Apply Now' to update active session" 
                  : "Will apply automatically when you start a session"}
              </p>
              {isSessionActive && (
                <button
                  onClick={applyInstructions}
                  className="px-4 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Apply Now
                </button>
              )}
            </div>
          </div>

          {/* Example Templates Section */}
          <div className="mb-6">
            <h3 className="text-md font-semibold mb-2">Example Templates</h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setCustomInstructions("You are a professional trading assistant specializing in F&O strategies. Always provide risk assessments and real-world examples.")}
                className="text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 text-sm"
              >
                <strong>Trading Assistant</strong>
                <p className="text-xs text-gray-600">Professional F&O trading advisor</p>
              </button>
              <button
                onClick={() => setCustomInstructions("You are a friendly teacher. Explain complex topics in simple terms with analogies. Speak slowly and clearly.")}
                className="text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 text-sm"
              >
                <strong>Friendly Teacher</strong>
                <p className="text-xs text-gray-600">Patient educator with simple explanations</p>
              </button>
              <button
                onClick={() => setCustomInstructions("You are a concise AI. Answer in one sentence maximum unless asked for details.")}
                className="text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 text-sm"
              >
                <strong>Concise Mode</strong>
                <p className="text-xs text-gray-600">Brief, to-the-point responses</p>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex justify-end gap-2">
          <button
            onClick={() => {
              setCustomInstructions('');
              localStorage.removeItem('customInstructions');
            }}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
          >
            Clear All
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 text-white text-sm rounded-md hover:bg-gray-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
