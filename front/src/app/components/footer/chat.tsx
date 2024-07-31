"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import data from '../../api.json';
import { useAuth } from '@/app/authContext';
import { useRouter } from 'next/navigation';
import { Truck } from 'lucide-react';
import { AppBuildManifestPlugin } from 'next/dist/build/webpack/plugins/app-build-manifest-plugin';

interface Match {
    id: number;
    useruuid: number;
    matchedUseruuid: number;
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

// interface Notification {
//     senderId: number;
//     message: string;
//     avatar: string;
//     createdAt: new Date() | string;
// };

export default function Component() {
    const router = useRouter();
    const { user, isJwtInCookie } = useAuth();
    const [isMatchsListOpen, setIsMatchsListOpen] = useState(false);
    const [isChatWindowOpen, setIsChatWindowOpen] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const chatWindowRef = useRef<HTMLDivElement>(null);
    const matchListWindowRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messageInputRef = useRef<HTMLTextAreaElement>(null);

    // [MOCK]
    // faire une fonction qui est trigger lorsqu'on clique sur l'icon des 2 bonhommes pour ouvrir la liste de tchat
    // un event est listen en permanence pour ecouter si j'ai des nouveaux messages ou pas (newMessage)
    // un autre est listen lorsqu'on ouvre le tchat avec qqn (message)
    const [matchs, setMatchs] = useState<Match[]>([
        { id: 1, name: "John Doe", avatar: "https://picsum.photos/201", messages: data.messagesRoom1 },
        { id: 2, name: "Jane Smith", avatar: "https://picsum.photos/202", messages: data.messagesRoom2 },
        { id: 3, name: "Bob Johnson", avatar: "https://picsum.photos/203", messages: data.messagesRoom3 },
    ]);

    const openChatWindow = (match: Match) => {
        // call the endpoint that give me all the messages
        setSelectedMatch(match);
        setIsMatchsListOpen(false);
        setIsChatWindowOpen(true);
    };

    const sendMessage = (text: string) => {
        if (!text) {
            return;
        }
        const newMessage: Message = {
            id: selectedMatch!.messages.length + 1,
            text,
            isMe: true,
            timestamp: new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }),
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
            setIsLoggedIn(isJwtInCookie());
        };
    }, []);

    useEffect(() => {
        scrollToBottom();
        if (messageInputRef.current) {
            messageInputRef.current.focus();
        }
    }, [selectedMatch?.messages]);

    return (
        <>
            {isLoggedIn && (
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
                                                color="orange"
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
                            className={`fixed inset-0 z-20 flex items-end justify-end bg-black/50 transition-opacity duration-300 ${isChatWindowOpen ? "opacity-100" : "pointer-events-none opacity-0"
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
                                                className={`max-w-[70%] break-words rounded-lg px-4 py-2 ${message.isMe ? "bg-black text-primary-foreground" : "bg-muted text-black"
                                                    }`}
                                            >
                                                <div>{message.text}</div>
                                                <div className={message.isMe ? "mt-1 text-xs text-primary-foreground" : "mt-1 text-xs text-black"}>{message.timestamp}</div>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div >
                                <div className="mt-4">
                                    <Textarea
                                        ref={messageInputRef}
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
            )}
        </>
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
