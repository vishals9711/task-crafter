import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { DetailLevel, ExtractedTasks, Task, TaskExtractionRequest } from '@/types/task';
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

// Task extraction prompts for different detail levels
const taskExtractionPrompts = {
    [DetailLevel.LOW]: `
You are a task extraction assistant. Your goal is to break down a high-level task into a small set of clear, actionable steps.

Instructions (LOW DETAIL level):
1. Identify the core task from the input.
2. Extract only the ESSENTIAL steps required to complete the task.
3. Limit the output to 2-3 key subtasks.
4. Keep descriptions extremely brief (1 sentence per subtask) and action-oriented.
5. Focus only on the big picture steps, avoiding any implementation details.

Focus on:
- Highest-level actions only
- Extremely concise wording
- Only the most critical steps
`,

    [DetailLevel.MEDIUM]: `
You are a task extraction assistant. Your goal is to break down a high-level task into a balanced set of clear, actionable steps.

Instructions (MEDIUM DETAIL level):
1. Identify the core task from the input.
2. Extract the important steps required to complete the task.
3. Provide 3-5 key subtasks.
4. Keep descriptions brief (1-2 sentences per subtask) and action-oriented.
5. Order subtasks logically, highlighting dependencies if any.

Focus on:
- Actionable outcomes, not technical implementation
- Avoid overly granular or repetitive steps
- Cover the entire task without unnecessary detail
`,

    [DetailLevel.HIGH]: `
You are a task extraction assistant. Your goal is to break down a high-level task into a comprehensive set of detailed, actionable steps.

Instructions (HIGH DETAIL level):
1. Identify the core task from the input and provide a thorough breakdown.
2. Extract ALL steps required to complete the task, including intermediate steps.
3. Provide 5-8 subtasks with detailed descriptions.
4. Include implementation guidance and considerations for each subtask.
5. Order subtasks logically, with clear dependencies and sequence.

Focus on:
- Comprehensive coverage of all aspects of the task
- Detailed explanations and implementation suggestions
- Technical considerations and best practices
- Potential challenges and how to address them
`
};

async function processWithLLM(text: string, detailLevel: DetailLevel): Promise<ExtractedTasks> {
    try {
        const result = await generateObject({
            model: openai('gpt-4o-mini'),
            schema: taskResponseSchema,
            schemaName: 'TaskExtraction',
            schemaDescription: 'Extract a main task and subtasks from the input text',
            system: taskExtractionPrompts[detailLevel],
            prompt: text,
            temperature: 0,
            maxTokens: detailLevel === DetailLevel.HIGH ? 800 : 500, // Increase token limit for high detail
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
        const { text, detailLevel = DetailLevel.MEDIUM } = await request.json() as TaskExtractionRequest;

        if (!text || typeof text !== 'string') {
            return NextResponse.json(
                { error: 'Text is required and must be a string' },
                { status: 400 }
            );
        }

        const result = await processWithLLM(text, detailLevel);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error in extract-tasks API route:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 
