'use client';

import { useState, useRef, useEffect } from 'react';
import { useChatMessages } from '@/hooks/useChatMessages';
import useLocalStorage from '@/hooks/useLocalStorage';
import "../styles/pages/chat.css";

interface ChatBoxProps {
    groupId: string;
    userId: string;
    username: string;
}

export function ChatBox({ groupId, userId, username }: ChatBoxProps) {
    const { value: token } = useLocalStorage<string>('token', '');
    const { messages, sendMessage, clearMessages } = useChatMessages(groupId, token);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const handleSend = () => {
        if (!input.trim()) return;
        sendMessage(userId, input.trim());
        setInput('');
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages]);

    return (
        <div className="chat-container">
            {/*<div className="chat-header">*/}
            {/*    <h2>Group Chat</h2>*/}
            {/*</div>*/}

            <div className="chat-messages">
                {messages.map((msg, idx) => {
                    const time = new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
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
                            className={`message ${isOwnMessage ? 'message-own' : 'message-other'}`}
                        >
                            <div className="message-header">
                                <strong>{msg.senderName}</strong>
                                <span className="message-time">at {time}</span>
                            </div>
                            <div className="message-content">{msg.content}</div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-container">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="Type a message..."
                    className="chat-input"
                />
                <div className="chat-buttons">
                    <button onClick={clearMessages} className="clear-button">Clear Chat</button>
                    <button onClick={handleSend}>Send Message</button>
                </div>
            </div>
        </div>
    );
}