import React from "react";
import { useEffect, useState } from "react";

const voices = [
  { value: "alloy", label: "Alloy - Neutral, balanced tone" },
  { value: "echo", label: "Echo - Clear, professional" },
  { value: "fable", label: "Fable - Warm, expressive" },
  { value: "onyx", label: "Onyx - Deep, authoritative" },
  { value: "nova", label: "Nova - Bright, energetic" },
  { value: "shimmer", label: "Shimmer - Soft, gentle" },
  { value: "marin", label: "Marin - Current default" },
];

const functionDescription = `
Call this function when a user asks for a color palette.
`;

const sessionUpdate = {
  type: "session.update",
  session: {
    type: "realtime",
    tools: [
      {
        type: "function",
        name: "display_color_palette",
        description: functionDescription,
        parameters: {
          type: "object",
          strict: true,
          properties: {
            theme: {
              type: "string",
              description: "Description of the theme for the color scheme.",
            },
            colors: {
              type: "array",
              description: "Array of five hex color codes based on the theme.",
              items: {
                type: "string",
                description: "Hex color code",
              },
            },
          },
          required: ["theme", "colors"],
        },
      },
    ],
    tool_choice: "auto",
  },
};

function FunctionCallOutput({ functionCallOutput }) {
  const { theme, colors } = JSON.parse(functionCallOutput.arguments);

  const colorBoxes = colors.map((color) => (
    <div
      key={color}
      className="w-full h-16 rounded-md flex items-center justify-center border border-gray-200"
      style={{ backgroundColor: color }}
    >
      <p className="text-sm font-bold text-black bg-slate-100 rounded-md p-2 border border-black">
        {color}
      </p>
    </div>
  ));

  return (
    <div className="flex flex-col gap-2">
      <p>Theme: {theme}</p>
      {colorBoxes}
      <pre className="text-xs bg-gray-100 rounded-md p-2 overflow-x-auto">
        {JSON.stringify(functionCallOutput, null, 2)}
      </pre>
    </div>
  );
}

export default function ToolPanel({
  isSessionActive,
  sendClientEvent,
  events,
  showOnlyVoice = false,
}) {
  const [functionAdded, setFunctionAdded] = useState(false);
  const [functionCallOutput, setFunctionCallOutput] = useState(null);
  const [selectedVoice, setSelectedVoice] = useState(() => {
    // Check if we're in browser environment (not SSR)
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedVoice = localStorage.getItem('selectedVoice');
      return savedVoice || 'marin';
    }
    return 'marin'; // Fallback for SSR
  });
  const [voiceApplied, setVoiceApplied] = useState(false);

  // Handle voice selection change
  const handleVoiceChange = (event) => {
    const newVoice = event.target.value;
    setSelectedVoice(newVoice);
    localStorage.setItem('selectedVoice', newVoice);
    
    // If session is active, immediately apply the voice change
    if (isSessionActive) {
      console.log("[voice] applying immediate voice change:", newVoice);
      sendClientEvent({
        type: "session.update",
        session: {
          audio: {
            output: {
              voice: newVoice,
            },
          },
        },
      });
    }
  };

  useEffect(() => {
    if (!events || events.length === 0) return;

    const firstEvent = events[events.length - 1];
    if (!functionAdded && firstEvent.type === "session.created") {
      sendClientEvent(sessionUpdate);
      setFunctionAdded(true);
    }

    // Apply selected voice when session is created
    if (!voiceApplied && firstEvent.type === "session.created") {
      sendClientEvent({
        type: "session.update",
        session: {
          audio: {
            output: {
              voice: selectedVoice,
            },
          },
        },
      });
      setVoiceApplied(true);
    }

    const mostRecentEvent = events[0];
    if (
      mostRecentEvent.type === "response.done" &&
      mostRecentEvent.response.output
    ) {
      mostRecentEvent.response.output.forEach((output) => {
        if (
          output.type === "function_call" &&
          output.name === "display_color_palette"
        ) {
          setFunctionCallOutput(output);
          setTimeout(() => {
            sendClientEvent({
              type: "response.create",
              response: {
                instructions: `
                ask for feedback about the color palette - don't repeat 
                the colors, just ask if they like the colors.
              `,
              },
            });
          }, 500);
        }
      });
    }
  }, [events]);

  useEffect(() => {
    if (!isSessionActive) {
      setFunctionAdded(false);
      setFunctionCallOutput(null);
      setVoiceApplied(false);
    }
  }, [isSessionActive]);

  return (
    <section className="w-full">
      {/* Voice Selector - Ultra compact for bottom placement */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-600">Voice:</span>
        <select
          id="voice-select"
          value={selectedVoice}
          onChange={handleVoiceChange}
          className="border border-gray-300 rounded-md px-2 py-1 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          disabled={false}
        >
          {voices.map((voice) => (
            <option key={voice.value} value={voice.value}>
              {voice.label}
            </option>
          ))}
        </select>
        {!isSessionActive && (
          <span className="text-xs text-gray-400">
            Start session to change
          </span>
        )}
      </div>

      {/* Color Palette Tool */}
      {showOnlyVoice ? null : (
        <div className="h-full bg-gray-50 rounded-md p-4">
          <h2 className="text-lg font-bold">Color Palette Tool</h2>
          {isSessionActive
            ? (
              functionCallOutput
                ? <FunctionCallOutput functionCallOutput={functionCallOutput} />
                : <p>Ask for advice on a color palette...</p>
            )
            : <p>Start the session to use this tool...</p>}
        </div>
      )}
    </section>
  );
}
