import { motion } from 'framer-motion';
import { GithubIcon, ExternalLink } from 'lucide-react';

interface Issue {
  url: string;
  title?: string;
}

interface IssuesListProps {
  mainIssue: Issue;
  subtaskIssues: Issue[];
}

export default function IssuesList({ mainIssue, subtaskIssues }: IssuesListProps) {

  return (
    <div className="space-y-6 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl p-6 backdrop-blur-lg border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <GithubIcon className="w-6 h-6 text-white/70" />
            <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
              Main Issue
            </h3>
          </div>
          <a
            href={mainIssue.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <span className="truncate">{mainIssue.title || mainIssue.url}</span>
            <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        </div>

        {subtaskIssues.length > 0 && (
          <div className="bg-gradient-to-r from-blue-500/10 to-green-500/10 rounded-xl p-6 backdrop-blur-lg border border-white/10 mt-6">
            <h3 className="text-xl font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400">
              Subtask Issues
            </h3>
            <div className="space-y-3">
              {subtaskIssues.map((issue, index) => (
                <a
                  key={index}
                  href={issue.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                >
                  <span className="truncate">{issue.title || issue.url}</span>
                  <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
} 
