"use client";

import React, { useState } from "react";
import {
    Plus,
    Search,
    Star,
    Clock,
    CheckCircle,
    ChevronDown,
    ChevronRight,
    Calendar,
    User,
    Briefcase,
    Circle,
    Inbox
} from "lucide-react";
import { Button } from "./ui/button";
import { Header } from "./header";

interface TodoItem {
    id: string;
    text: string;
    completed: boolean;
}

interface TodoFolder {
    id: string;
    name: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    todos: TodoItem[];
    isExpanded: boolean;
}

interface SidebarProps {
    folders: TodoFolder[];
    onToggleFolder: (folderId: string) => void;
    onToggleTodo: (folderId: string, todoId: string) => void;
    onAddNew?: () => void;
}

export const Sidebar = ({ folders, onToggleFolder, onToggleTodo, onAddNew }: SidebarProps) => {
    return (
        <div className="flex w-64 flex-none flex-col items-start gap-4 self-stretch overflow-auto mobile:h-auto mobile:w-full mobile:flex-none pt-6 pl-4">
            {/* Add Button and Header - Properly aligned */}
            <div className="flex w-full items-start justify-between">
                <div className="flex-1">
                    <Header />
                </div>
                <Button
                    variant="ghost"
                    size="icon-lg"
                    onClick={onAddNew}
                    className="shrink-0 translate-y-1"
                >
                    <Plus size={16} />
                </Button>
            </div>

            {/* Navigation Tree */}
            <div className="w-full space-y-1 mobile:hidden">
                {/* Quick Access */}
                <div className="space-y-1">
                    <button className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-foreground hover:bg-accent rounded-md">
                        <Inbox size={16} className="text-primary" />
                        <span>Inbox</span>
                    </button>
                    <button className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-foreground hover:bg-accent rounded-md">
                        <Calendar size={16} className="text-accent-mint" />
                        <span>Upcoming</span>
                    </button>
                    <button className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-foreground hover:bg-accent rounded-md">
                        <Clock size={16} className="text-accent-orange" />
                        <span>Recent</span>
                    </button>
                    <button className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-foreground hover:bg-accent rounded-md">
                        <CheckCircle size={16} className="text-accent-orchid" />
                        <span>Completed</span>
                    </button>
                </div>

                {/* Folders */}
                <div className="pt-2">
                    <div className="text-xs font-medium text-muted-foreground px-2 py-2">
                        FOLDERS
                    </div>
                    {folders.map((folder) => {
                        const IconComponent = folder.icon;
                        return (
                            <div key={folder.id} className="space-y-1">
                                <button
                                    onClick={() => onToggleFolder(folder.id)}
                                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-foreground hover:bg-accent rounded-md"
                                >
                                    {folder.isExpanded ? (
                                        <ChevronDown size={16} />
                                    ) : (
                                        <ChevronRight size={16} />
                                    )}
                                    <IconComponent size={16} />
                                    <span className="flex-1 text-start">{folder.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {folder.todos.filter(t => !t.completed).length}
                                    </span>
                                </button>

                                {folder.isExpanded && (
                                    <div className="ml-6 space-y-1">
                                        {folder.todos.map((todo) => (
                                            <button
                                                key={todo.id}
                                                onClick={() => onToggleTodo(folder.id, todo.id)}
                                                className="w-full flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground hover:bg-accent rounded-md"
                                            >
                                                {todo.completed ? (
                                                    <CheckCircle size={16} />
                                                ) : (
                                                    <Circle size={16} />
                                                )}
                                                <span className={`flex-1 text-left ${todo.completed ? 'line-through' : ''}`}>
                                                    {todo.text}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};