import React from "react";
import { useState } from "react";
import { CloudLightning, CloudOff, MessageSquare, Mic, MicOff, Pause, Play } from "react-feather";
import Button from "./Button";

function SessionStopped({ startSession }) {
  const [isActivating, setIsActivating] = useState(false);

  function handleStartSession() {
    if (isActivating) return;

    setIsActivating(true);
    startSession();
  }

  return (
    <Button
      onClick={handleStartSession}
      className={`text-nowrap ${isActivating ? "bg-gray-600" : "bg-red-600"}`}
      icon={<CloudLightning height={16} />}
    >
      {isActivating ? "starting session..." : "start session"}
    </Button>
  );
}

function SessionActive({ stopSession, sendTextMessage, micTrack }) {
  const [message, setMessage] = useState("");
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  function handleSendClientEvent() {
    sendTextMessage(message);
    setMessage("");
  }

  const toggleMic = () => {
    if (micTrack) {
      micTrack.enabled = !micTrack.enabled;
      setIsMicMuted(!micTrack.enabled);
    }
  };

  const togglePause = () => {
    // Pause implementation: stop/resume data channel or use VAD control
    setIsPaused(!isPaused);
    // Send session.update to control turn detection if needed
  };

  return (
    <div className="flex items-center gap-4">
      <input
        onKeyDown={(e) => {
          if (e.key === "Enter" && message.trim()) {
            handleSendClientEvent();
          }
        }}
        type="text"
        placeholder="send a text message..."
        className="border border-gray-200 rounded-full p-4 w-80"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <Button
        onClick={() => {
          if (message.trim()) {
            handleSendClientEvent();
          }
        }}
        icon={<MessageSquare height={16} />}
        className="text-nowrap bg-blue-400"
      >
        send text
      </Button>
      <Button
        onClick={toggleMic}
        icon={isMicMuted ? <MicOff height={16} /> : <Mic height={16} />}
        className={isMicMuted ? "bg-red-500" : "bg-green-500"}
      >
        {isMicMuted ? "unmute" : "mute"}
      </Button>
      <Button
        onClick={togglePause}
        icon={isPaused ? <Play height={16} /> : <Pause height={16} />}
        className={isPaused ? "bg-gray-500" : "bg-blue-500"}
      >
        {isPaused ? "resume" : "pause"}
      </Button>
      <Button onClick={stopSession} icon={<CloudOff height={16} />}>
        disconnect
      </Button>
    </div>
  );
}

export default function SessionControls({
  startSession,
  stopSession,
  sendClientEvent,
  sendTextMessage,
  serverEvents,
  isSessionActive,
  micTrack,
}) {
  return (
    <>
      {isSessionActive ? (
        <SessionActive
          stopSession={stopSession}
          sendClientEvent={sendClientEvent}
          sendTextMessage={sendTextMessage}
          serverEvents={serverEvents}
          micTrack={micTrack}
        />
      ) : (
        <SessionStopped startSession={startSession} />
      )}
    </>
  );
}
