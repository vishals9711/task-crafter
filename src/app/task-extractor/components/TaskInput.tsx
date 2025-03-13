import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { DetailLevel } from '@/types/task';
import { DetailLevelSelector } from './DetailLevelSelector';

interface TaskInputProps {
  inputText: string;
  isProcessing: boolean;
  detailLevel: DetailLevel;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onDetailLevelChange: (level: DetailLevel) => void;
  onExtractTasks: () => void;
}

export function TaskInput({ 
  inputText, 
  isProcessing, 
  detailLevel,
  onInputChange, 
  onDetailLevelChange,
  onExtractTasks 
}: TaskInputProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="h-full bg-black/30 backdrop-blur-xl border-white/10 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-white/90">Input</CardTitle>
          <CardDescription className="text-white/50">
            Enter your free-form text here. Be as detailed as possible.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="e.g. Create a new user authentication system with login, registration, and password reset functionality..."
            className="min-h-[300px] bg-black/20 border-white/10 focus:border-white/20 placeholder:text-white/30"
            value={inputText}
            onChange={onInputChange}
          />
          
          <DetailLevelSelector 
            value={detailLevel}
            onChange={onDetailLevelChange}
            className="pt-4"
          />
        </CardContent>
        <CardFooter>
          <Button 
            onClick={onExtractTasks} 
            disabled={isProcessing || !inputText.trim()}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
          >
            {isProcessing ? 'Processing...' : 'Extract Tasks'}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
} 
