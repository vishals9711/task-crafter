import { useState } from 'react';
import { toast } from 'sonner';
import { ExtractedTasks, GitHubIssueCreationResult } from '@/types/task';

export const useTaskExtraction = () => {
    const [inputText, setInputText] = useState('');
    const [extractedTasks, setExtractedTasks] = useState<ExtractedTasks | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [markdownText, setMarkdownText] = useState('');
    const [creationResult, setCreationResult] = useState<GitHubIssueCreationResult | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputText(e.target.value);
        // Reset creation result when input changes
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
                body: JSON.stringify({ text: inputText }),
            });

            if (!response.ok) {
                throw new Error('Failed to extract tasks');
            }

            const data: ExtractedTasks = await response.json();
            setExtractedTasks(data);

            if (data.success) {
                generateMarkdown(data.mainTask);
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
        navigator.clipboard.writeText(markdownText)
            .then(() => {
                toast.success('Markdown copied to clipboard');
            })
            .catch((error) => {
                console.error('Error copying to clipboard:', error);
                toast.error('Failed to copy to clipboard');
            });
    };

    return {
        inputText,
        extractedTasks,
        isProcessing,
        markdownText,
        creationResult,
        setCreationResult,
        handleInputChange,
        handleExtractTasks,
        handleSubtaskToggle,
        copyMarkdownToClipboard,
    };
}; 
