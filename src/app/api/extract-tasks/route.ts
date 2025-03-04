import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { ExtractedTasks, Task } from '@/types/task';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

// Increase the timeout for this API route
export const runtime = 'edge'; // Use Edge runtime for better performance
export const maxDuration = 120; // Set maximum duration to 120 seconds (2 minutes)

// Define the schema for the task extraction response
const taskResponseSchema = z.object({
    mainTask: z.object({
        title: z.string(),
        description: z.string(),
    }),
    subtasks: z.array(
        z.object({
            title: z.string(),
            description: z.string(),
        })
    ),
});

const taskExtractionPrompt = `
You are a task extraction assistant. Your goal is to break down a high-level task into a small set of clear, actionable steps.

Instructions:
1. Identify the core task from the input.
2. Extract **only the essential** steps required to complete the task.
3. Limit the output to **3-5 key subtasks**.
4. Keep descriptions **brief** (1-2 sentences per subtask) and **action-oriented**.
5. Order subtasks logically, highlighting dependencies if any.

Focus on:
- Actionable outcomes, not technical implementation.
- Avoid overly granular or repetitive steps.
- Cover the entire task without unnecessary detail.
`;

async function processWithLLM(text: string): Promise<ExtractedTasks> {
    try {

        const result = await generateObject({
            model: openai('gpt-4o-mini'),
            schema: taskResponseSchema,
            schemaName: 'TaskExtraction',
            schemaDescription: 'Extract a main task and subtasks from the input text',
            system: taskExtractionPrompt,
            prompt: text,
            temperature: 0,
            maxTokens: 500, // Reduced token limit for faster responses
            mode: 'json', // Explicitly use JSON mode for faster processing
        });

        const parsedContent = result.object;


        const subtasks = parsedContent.subtasks.map((subtask) => {
            if (!subtask.title || !subtask.description) {
                console.warn('Subtask missing title or description, using defaults');
                return {
                    id: uuidv4(),
                    title: subtask.title || 'Untitled subtask',
                    description: subtask.description || 'No description provided',
                    selected: true,
                };
            }

            return {
                id: uuidv4(),
                title: subtask.title,
                description: subtask.description,
                selected: true,
            };
        });

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
            title: parsedContent.mainTask.title,
            description: parsedContent.mainTask.description,
            subtasks,
        };

        return {
            mainTask,
            success: true,
        };
    } catch (error) {
        console.error('Error processing text with OpenAI:', error);
        return {
            mainTask: {
                id: uuidv4(),
                title: '',
                description: '',
                subtasks: [],
            },
            success: false,
            error: error instanceof Error ? error.message : 'Failed to process text with OpenAI. Please try again.',
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
