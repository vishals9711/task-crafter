import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { ExtractedTasks, Task } from '@/types/task';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Define interfaces for OpenAI response structure
interface OpenAISubtask {
    title: string;
    description: string;
}

interface OpenAITaskResponse {
    mainTask: {
        title: string;
        description: string;
    };
    subtasks: OpenAISubtask[];
}

// Task extraction prompt
const taskExtractionPrompt = `You are a task extraction assistant specialized in breaking down complex tasks into manageable components.

Your job is to:
1. Identify the main overarching task or project from the provided text
2. Extract logical subtasks that would help complete the main task
3. Ensure each subtask is specific, actionable, and clearly defined
4. Organize subtasks in a logical sequence of implementation
5. Provide concise but descriptive titles and detailed descriptions

When analyzing the text:
- Focus on actionable items and deliverables
- Identify dependencies between subtasks
- Estimate appropriate granularity (not too broad, not too specific)
- Ensure all critical aspects of the main task are covered by subtasks`;

// Output structure specification
const outputStructurePrompt = `Format your response as a valid JSON object with the following structure:
{
    "mainTask": {
        "title": "Clear, concise title of the main task",
        "description": "Detailed description of what needs to be accomplished"
    },
    "subtasks": [
        {
            "title": "Specific, actionable subtask title",
            "description": "Detailed description of the subtask with any relevant details"
        },
        ...
    ]
}`;

async function processWithLLM(text: string): Promise<ExtractedTasks> {
    try {
        // Call OpenAI API to extract structured task information
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `${taskExtractionPrompt}\n\n${outputStructurePrompt}`
                },
                {
                    role: "user",
                    content: text
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0.3,
            max_tokens: 2000
        });

        // Parse the response
        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error("No content returned from OpenAI");
        }

        let parsedContent: OpenAITaskResponse;
        try {
            parsedContent = JSON.parse(content) as OpenAITaskResponse;

            // Validate the parsed content
            if (!parsedContent.mainTask || !parsedContent.subtasks) {
                throw new Error("Invalid response structure: missing mainTask or subtasks");
            }

            if (!parsedContent.mainTask.title || !parsedContent.mainTask.description) {
                throw new Error("Invalid mainTask: missing title or description");
            }

            if (!Array.isArray(parsedContent.subtasks)) {
                throw new Error("Invalid subtasks: not an array");
            }
        } catch (parseError) {
            console.error('Error parsing OpenAI response:', parseError, content);
            throw new Error(`Failed to parse OpenAI response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
        }

        // Map the parsed content to our expected structure
        const subtasks = parsedContent.subtasks.map((subtask: OpenAISubtask) => {
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
            error: 'Failed to process text with OpenAI. Please try again.',
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
