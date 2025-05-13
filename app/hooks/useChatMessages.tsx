"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getApiDomain } from "@/utils/domain";

interface ReceivedMessage {
  type: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
}

const MAX_MESSAGES = 500;

function getStorageKey(groupId: string) {
  return `chat_messages_${groupId}`;
}

function loadStoredMessages(groupId: string): ReceivedMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const key = getStorageKey(groupId);
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function storeMessages(groupId: string, messages: ReceivedMessage[]) {
  try {
    const key = getStorageKey(groupId);
    const trimmed = messages.slice(-MAX_MESSAGES); // keep last N
    localStorage.setItem(key, JSON.stringify(trimmed));
  } catch (err) {
    console.warn("Could not store messages:", err);
  }
}

export function useChatMessages(groupId: string, token: string | null) {
  const [messages, setMessages] = useState<ReceivedMessage[]>(
    loadStoredMessages(groupId),
  );
  const clientRef = useRef<Client | null>(null);

  const addMessage = useCallback(
    (msg: ReceivedMessage) => {
      setMessages((prev) => {
        const updated = [...prev, msg].slice(-MAX_MESSAGES);
        storeMessages(groupId, updated);
        return updated;
      });
    },
    [groupId],
  );

  useEffect(() => {
    if (!token || typeof window === "undefined") return;

    const backendHost = getApiDomain();

    const socket = new SockJS(`${backendHost}/ws`);
    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: token,
      },
      debug: () => {},
      onStompError: (frame) => {
        console.error("STOMP error:", frame);
      },
    });

    client.onConnect = () => {
      console.log("Connected to WebSocket");
      client.subscribe(`/topic/group.${groupId}`, (message: IMessage) => {
        try {
          const payload = JSON.parse(message.body);
          if (payload.type === "CHAT") {
            addMessage(payload as ReceivedMessage);
          }
        } catch (err) {
          console.error("Failed to parse message:", err);
        }
      });
    };

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [groupId, token, addMessage]);

  const sendMessage = (senderId: string, content: string) => {
    if (!token || !clientRef.current) return;

    const payload = {
      senderId,
      groupId,
      content,
    };

    clientRef.current.publish({
      destination: `/app/group.message`,
      body: JSON.stringify(payload),
      headers: {
        Authorization: token,
      },
    });
  };

  const clearMessages = () => {
    const storageKey = `chat_messages_${groupId}`;
    localStorage.removeItem(storageKey);
    setMessages([]);
  };

  return { messages, sendMessage, clearMessages };
}
