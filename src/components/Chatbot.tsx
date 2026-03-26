'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, User, ChevronDown } from 'lucide-react';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Hello! I'm your LakshmiAgro Assistant. How can I help you with your farming needs today?",
            sender: 'ai',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: input,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('http://127.0.0.1:8000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: input }),
            });

            const data = await response.json();

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: data.response || "I'm sorry, I couldn't process that request.",
                sender: 'ai',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error('Chat error:', error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: "I'm having trouble connecting to the AI service. Please try again later.",
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-green-100 animate-in slide-in-from-bottom-4 duration-300">
                    {/* Header */}
                    <div className="bg-green-700 p-4 flex justify-between items-center text-white shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-full">
                                <Bot className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Agri Assistant</h3>
                                <div className="flex items-center gap-1.5">
                                    <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></span>
                                    <span className="text-[10px] text-green-100 uppercase tracking-widest font-bold">Online</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="hover:bg-green-600 p-1.5 rounded-full transition-colors"
                        >
                            <ChevronDown className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}
                            >
                                <div className={`flex gap-2 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm ${msg.sender === 'user' ? 'bg-green-600 text-white' : 'bg-white border border-green-100 text-green-700'
                                        }`}>
                                        {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                    </div>
                                    <div className={`p-3 rounded-2xl text-sm shadow-sm ${msg.sender === 'user'
                                        ? 'bg-green-600 text-white rounded-tr-none'
                                        : 'bg-white text-gray-800 rounded-tl-none border border-green-50'
                                        }`}>
                                        <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                        <p className={`text-[9px] mt-1.5 opacity-60 font-medium ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start animate-in fade-in duration-300">
                                <div className="flex gap-2 items-center bg-white border border-green-50 p-3 rounded-2xl rounded-tl-none shadow-sm">
                                    <Loader2 className="h-4 w-4 text-green-600 animate-spin" />
                                    <span className="text-xs text-gray-500 font-medium italic">Assistant is typing...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-gray-100">
                        <div className="relative flex items-center gap-2">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Ask about crops, soil, pests..."
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white resize-none transition-all pr-12 min-h-[44px] max-h-[120px]"
                                rows={1}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className={`absolute right-1.5 p-2 rounded-lg transition-all ${input.trim() && !isLoading
                                    ? 'bg-green-600 text-white hover:bg-green-700 shadow-md'
                                    : 'bg-gray-100 text-gray-400'
                                    }`}
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </div>
                        <p className="text-[9px] text-gray-400 text-center mt-3 uppercase tracking-tighter font-bold">
                            AI-powered Agricultural Advice
                        </p>
                    </div>
                </div>
            )}

            {/* Floating Bubble */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-center h-14 w-14 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 ${isOpen ? 'bg-gray-100 text-gray-600 rotate-90' : 'bg-green-700 text-white hover:bg-green-800'
                    }`}
            >
                {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white"></span>
                    </span>
                )}
            </button>
        </div>
    );
};

export default Chatbot;
