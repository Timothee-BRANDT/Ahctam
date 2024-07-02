"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import data from '../../api.json';

interface Match {
    id: number;
    name: string;
    avatar: string;
    messages: Message[];
}

interface Message {
    id: number;
    text: string;
    isMe: boolean;
    timestamp: string;
}

export default function Component() {
    const [isMatchsListOpen, setIsMatchsListOpen] = useState(false);
    const [isChatWindowOpen, setIsChatWindowOpen] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const chatWindowRef = useRef<HTMLDivElement>(null);
    const matchListWindowRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // [MOCK]
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: "Hello, how are you?", isMe: false, timestamp: "10:30 AM" },
        { id: 2, text: "I'm doing great, thanks for asking!", isMe: true, timestamp: "10:31 AM" },
        { id: 3, text: "That's good to hear. Do you have any plans for the weekend?", isMe: false, timestamp: "10:32 AM" },
        { id: 4, text: "I'm planning to go hiking with some matchs. How about you?", isMe: true, timestamp: "10:33 AM" },
        { id: 5, text: "That sounds like a lot of fun! I might just stay in and catch up on some reading.", isMe: false, timestamp: "10:34 AM" },
    ]);

    // [MOCK]
    const [matchs, setMatchs] = useState<Match[]>([
        { id: 1, name: "John Doe", avatar: "https://picsum.photos/201", messages: data.messagesRoom1 },
        { id: 2, name: "Jane Smith", avatar: "https://picsum.photos/202", messages: data.messagesRoom2 },
        { id: 3, name: "Bob Johnson", avatar: "https://picsum.photos/203", messages: data.messagesRoom3 },
    ]);

    const openChatWindow = (match: Match) => {
        setSelectedMatch(match);
        setIsMatchsListOpen(false);
        setIsChatWindowOpen(true);
    };

    const sendMessage = (text: string) => {
        const newMessage: Message = {
            id: selectedMatch!.messages.length + 1,
            text,
            isMe: true,
            timestamp: new Date().toLocaleTimeString(),
        };
        const updatedMatchs = matchs.map((m) =>
            m.id === selectedMatch!.id ? { ...m, messages: [...m.messages, newMessage] } : m
        );
        setMatchs(updatedMatchs);

        if (selectedMatch) {
            setSelectedMatch({ ...selectedMatch, messages: [...selectedMatch.messages, newMessage] });
        }
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (chatWindowRef.current && !chatWindowRef.current.contains(event.target as Node)) {
            setIsChatWindowOpen(false);
        }
        if (matchListWindowRef.current && !matchListWindowRef.current.contains(event.target as Node)) {
            setIsMatchsListOpen(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [selectedMatch?.messages]);

    return (
        <div className="relative">
            <Button variant="ghost" size="icon" className="mr-2" onClick={() => setIsMatchsListOpen(!isMatchsListOpen)}>
                <UsersIcon className="w-8 h-8" />
                <span className="sr-only">Open matchs list</span>
            </Button>
            {isMatchsListOpen && (
                <div ref={matchListWindowRef} className="right-0 z-10 mt-2 w-80 rounded-md bg-white shadow-lg border border-gray-300">
                    <div className="flex flex-col divide-y divide-gray-300">
                        <div className="p-4 bg-gray-100">
                            <h2 className="text-lg font-medium">Matchs</h2>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto bg-white">
                            {matchs.map((match) => (
                                <div 
                                    className="flex items-center gap-3 p-3 hover:bg-gray-200 cursor-pointer"
                                    onClick={() => openChatWindow(match)}>
                                    <Button
                                        key={match.id}
                                        variant="ghost"
                                        className="flex items-center gap-3 p-3 cursor-pointer"
                                    >
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={match.avatar} />
                                            <AvatarFallback>{match.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900">{match.name}</div>
                                        </div>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {isChatWindowOpen && (
                <div
                    className={`fixed inset-0 z-20 flex items-end justify-center bg-black/50 transition-opacity duration-300 ${isChatWindowOpen ? "opacity-100" : "pointer-events-none opacity-0"
                        }`}
                >
                    <div ref={chatWindowRef} className="relative w-full max-w-md rounded-t-lg bg-background p-4 sm:p-6">
                        <div className="flex items-center justify-between border-b pb-4">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={selectedMatch?.avatar || 'https://picsum.photos/200'} />
                                    <AvatarFallback>{selectedMatch?.name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="font-medium">{selectedMatch?.name}</div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full hover:bg-muted"
                                onClick={() => setIsChatWindowOpen(false)}
                            >
                                <XIcon className="w-5 h-5" />
                                <span className="sr-only">Close chat</span>
                            </Button>
                        </div>
                        <div className="mt-4 max-h-[400px] overflow-y-auto">
                            {selectedMatch!.messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`mb-2 flex items-end gap-2 ${message.isMe ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[70%] break-words rounded-lg px-4 py-2 ${message.isMe ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                            }`}
                                    >
                                        <div>{message.text}</div>
                                        <div className="mt-1 text-xs text-muted-foreground">{message.timestamp}</div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div >
                        <div className="mt-4">
                            <Textarea
                                placeholder="Type your message..."
                                className="min-h-[48px] rounded-lg resize-none border border-input bg-background p-3"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        sendMessage(e.currentTarget.value);
                                        e.currentTarget.value = '';
                                    }
                                }}
                            />
                            <Button className="mt-2 w-full" onClick={() => sendMessage((document.querySelector('textarea') as HTMLTextAreaElement).value)}>Send</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    );
}
