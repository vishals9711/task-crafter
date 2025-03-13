import { useState } from 'react';
import { toast } from 'sonner';
import { DetailLevel, ExtractedTasks, GitHubIssueCreationResult } from '@/types/task';

export const useTaskExtraction = (
    isAuthenticated: boolean = false,
    hasReachedLimit: boolean = false,
    incrementUsage?: () => void
) => {
    const [inputText, setInputText] = useState('');
    const [extractedTasks, setExtractedTasks] = useState<ExtractedTasks | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [markdownText, setMarkdownText] = useState('');
    const [creationResult, setCreationResult] = useState<GitHubIssueCreationResult | null>(null);
    const [detailLevel, setDetailLevel] = useState<DetailLevel>(DetailLevel.MEDIUM);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputText(e.target.value);
        // Reset creation result when input changes
        setCreationResult(null);
    };

    const handleDetailLevelChange = (level: DetailLevel) => {
        setDetailLevel(level);
        // Reset creation result when detail level changes
        setCreationResult(null);
    };

    const generateMarkdown = (task: ExtractedTasks['mainTask']) => {
        let markdown = `# ${task.title}\n\n${task.description}\n\n`;

        if (task.subtasks.length > 0) {
            markdown += '## Subtasks\n\n';
            task.subtasks.forEach((subtask) => {
                if (subtask.selected) {
                    markdown += `### ${subtask.title}\n${subtask.description}\n\n`;
                }
            });
        }

        setMarkdownText(markdown);
    };

    const handleSubtaskToggle = (subtaskId: string) => {
        if (!extractedTasks) return;

        const updatedSubtasks = extractedTasks.mainTask.subtasks.map((subtask) =>
            subtask.id === subtaskId ? { ...subtask, selected: !subtask.selected } : subtask
        );

        const updatedMainTask = {
            ...extractedTasks.mainTask,
            subtasks: updatedSubtasks,
        };

        setExtractedTasks({
            ...extractedTasks,
            mainTask: updatedMainTask,
        });

        generateMarkdown(updatedMainTask);
    };

    const handleExtractTasks = async () => {
        if (!inputText.trim()) {
            toast.error('Please enter some text to extract tasks from');
            return;
        }

        // Check if user has reached usage limit and is not authenticated
        if (!isAuthenticated && hasReachedLimit) {
            toast.error('You have reached the maximum number of free extractions. Please login with GitHub to continue.');
            return;
        }

        setIsProcessing(true);
        setExtractedTasks(null);
        // Also reset creation result when extracting new tasks
        setCreationResult(null);

        try {
            const response = await fetch('/api/extract-tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: inputText,
                    detailLevel: detailLevel
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to extract tasks');
            }

            const data: ExtractedTasks = await response.json();
            setExtractedTasks(data);

            if (data.success) {
                generateMarkdown(data.mainTask);

                // Increment usage count if user is not authenticated
                if (!isAuthenticated && incrementUsage) {
                    incrementUsage();
                }
            } else {
                toast.error(data.error || 'Failed to extract tasks');
            }
        } catch (error) {
            console.error('Error extracting tasks:', error);
            toast.error('An error occurred while extracting tasks');
        } finally {
            setIsProcessing(false);
        }
    };

    const copyMarkdownToClipboard = () => {
        if (!markdownText) return;

        navigator.clipboard.writeText(markdownText)
            .then(() => toast.success('Markdown copied to clipboard'))
            .catch((error) => {
                console.error('Error copying markdown:', error);
                toast.error('Failed to copy markdown to clipboard');
            });
    };

    return {
        inputText,
        extractedTasks,
        isProcessing,
        markdownText,
        creationResult,
        detailLevel,
        setCreationResult,
        handleInputChange,
        handleDetailLevelChange,
        handleExtractTasks,
        handleSubtaskToggle,
        copyMarkdownToClipboard,
    };
}; 
