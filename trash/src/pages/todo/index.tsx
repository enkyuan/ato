"use client";

import React, { useState } from "react";
import {
    Calendar,
    User,
    Briefcase,
    FileText,
    AppWindowMac,
    Dock
} from "lucide-react";
import { Sidebar } from "../../components/sidebar";
import { Kbd } from "../../components/ui/kbd";

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

export default function TodoPage() {
    const [folders, setFolders] = useState<TodoFolder[]>([
        {
            id: "1",
            name: "Daily Tasks",
            icon: Calendar,
            todos: [
                { id: "1", text: "Review project proposals", completed: false },
                { id: "2", text: "Team standup meeting", completed: true },
            ],
            isExpanded: true,
        },
        {
            id: "2",
            name: "Personal",
            icon: User,
            todos: [
                { id: "3", text: "Buy groceries", completed: false },
                { id: "4", text: "Call dentist", completed: false },
            ],
            isExpanded: true,
        },
        {
            id: "3",
            name: "Work Projects",
            icon: Briefcase,
            todos: [
                { id: "5", text: "Finish UI mockups", completed: false },
                { id: "6", text: "Code review for PR #123", completed: true },
            ],
            isExpanded: false,
        },
    ]);

    const toggleFolder = (folderId: string) => {
        setFolders(folders.map(folder =>
            folder.id === folderId
                ? { ...folder, isExpanded: !folder.isExpanded }
                : folder
        ));
    };

    const toggleTodo = (folderId: string, todoId: string) => {
        setFolders(folders.map(folder =>
            folder.id === folderId
                ? {
                    ...folder,
                    todos: folder.todos.map(todo =>
                        todo.id === todoId
                            ? { ...todo, completed: !todo.completed }
                            : todo
                    )
                }
                : folder
        ));
    };

    const handleAddNew = () => {
        // Add new folder/todo logic here
        console.log("Add new item");
    };

    return (
        <div className="flex h-screen w-full bg-background">
            {/* Sidebar - Fixed width and independent */}
            <Sidebar
                folders={folders}
                onToggleFolder={toggleFolder}
                onToggleTodo={toggleTodo}
                onAddNew={handleAddNew}
            />

            {/* Main Content Area - Inset with curved top-left corner */}
            <div className="flex-1 pt-4 pl-4">
                <div className="h-full w-full bg-accent rounded-tl-lg flex flex-col items-center justify-center">
                    <div className="text-center space-y-4">
                        <Dock size={64} className="mx-auto text-accent-mint" />
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-accent-mint">Click <Kbd className="font-semibold text-primary">cmd</Kbd> + <Kbd className="font-semibold text-primary">k</Kbd> to get started</h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}