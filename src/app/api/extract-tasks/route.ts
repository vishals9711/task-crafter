import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { ExtractedTasks, Task } from '@/types/task';

// Mock LLM processing for now - in a real app, you would use OpenAI or another LLM provider
async function processWithLLM(text: string): Promise<ExtractedTasks> {
    try {
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // This is a mock implementation - in a real app, you would call an actual LLM API
        const mainTaskTitle = text.split('\n')[0] || 'Main Task';
        const mainTaskDescription = text.length > 100 ? text.substring(0, 100) + '...' : text;

        // Extract potential subtasks (this is a simple heuristic - an LLM would do better)
        const subtasks = text
            .split('\n')
            .filter((line, index) => index > 0 && line.trim().length > 0)
            .map((line) => ({
                id: uuidv4(),
                title: line.length > 50 ? line.substring(0, 50) + '...' : line,
                description: line,
                selected: true,
            }));

        // If no subtasks were found, create a default one
        if (subtasks.length === 0) {
            subtasks.push({
                id: uuidv4(),
                title: 'Implement feature',
                description: 'Implement the described feature',
                selected: true,
            });
        }

        const mainTask: Task = {
            id: uuidv4(),
            title: mainTaskTitle,
            description: mainTaskDescription,
            subtasks,
        };

        return {
            mainTask,
            success: true,
        };
    } catch (error) {
        console.error('Error processing text with LLM:', error);
        return {
            mainTask: {
                id: uuidv4(),
                title: '',
                description: '',
                subtasks: [],
            },
            success: false,
            error: 'Failed to process text. Please try again.',
        };
    }
}

export async function POST(request: NextRequest) {
    try {
        const { text } = await request.json();

        if (!text || typeof text !== 'string') {
            return NextResponse.json(
                { error: 'Text is required and must be a string' },
                { status: 400 }
            );
        }

        const result = await processWithLLM(text);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error in extract-tasks API route:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 
