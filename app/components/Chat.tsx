"use client";

import { useState, useRef, useEffect } from "react";
import { useChatMessages } from "@/hooks/useChatMessages";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Button } from "antd";

import "../styles/components/Chat.css";

interface ChatBoxProps {
  groupId: string;
  userId: string;
}

export function ChatBox({ groupId, userId }: ChatBoxProps) {
  const { value: token } = useLocalStorage<string>("token", "");
  const { messages, sendMessage, clearMessages } = useChatMessages(
    groupId,
    token,
  );
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(userId, input.trim());
    setInput("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Group Chat</h2>
        <Button onClick={clearMessages} className="secondary">
          Clear Chat
        </Button>
      </div>

      <div className="chat-messages">
        {messages.map((msg, idx) => {
          const time = new Date(msg.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          const isOwnMessage = String(msg.senderId) === String(userId);

          // console.log('Rendering message:', {
          //     senderId: msg.senderId,
          //     userId,
          //     isOwnMessage,
          //     className: isOwnMessage ? 'message-own' : 'message-other'
          // });

          return (
            <div
              key={idx}
              className={`message ${isOwnMessage ? "message-own" : "message-other"}`}
            >
              <div className="message-content">{msg.content}</div>
              <div className="message-info">
                <strong>{msg.senderName}</strong>
                <span className="message-time"> at {time}</span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <div className="chat-input-send-container">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="chat-input"
          />
          <Button onClick={handleSend} className="secondary">
            Send Message
          </Button>
        </div>
      </div>
    </div>
  );
}
