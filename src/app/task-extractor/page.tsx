'use client';
import { motion } from 'framer-motion';
import { Toaster } from 'sonner';
import { useGitHubAuth } from './hooks/useGitHubAuth';
import { useRepositories } from './hooks/useRepositories';
import { useGitHubProjects } from './hooks/useGitHubProjects';
import { useTaskExtraction } from './hooks/useTaskExtraction';
import { useGitHubIssues } from './hooks/useGitHubIssues';
import { TaskInput } from './components/TaskInput';
import { TaskOutput } from './components/TaskOutput';
import { GitHubIntegration } from './components/GitHubIntegration';
import ParticleBackground from '@/components/ParticleBackground';
import IssuesList from '@/components/IssuesList';

export default function TaskExtractor() {
  
  // Custom hooks
  const { isGitHubLoggedIn, handleGitHubLogin } = useGitHubAuth();
  const { userRepos, selectedRepo, open, setOpen, handleRepoSelect } = useRepositories(isGitHubLoggedIn);
  const {
    userProjects,
    selectedProject,
    projectSelectorOpen,
    setProjectSelectorOpen,
    handleProjectSelect,
    isProjectsEnabled,
  } = useGitHubProjects(isGitHubLoggedIn);
  const {
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
  } = useTaskExtraction();
  const {
    isCreatingIssues,
    handleCreateGitHubIssues,
  } = useGitHubIssues(setCreationResult);

  const handleCreateIssues = () => {
    handleCreateGitHubIssues(
      extractedTasks,
      isGitHubLoggedIn,
      selectedRepo,
      selectedProject ? {
        id: selectedProject.id.toString(),
        number: selectedProject.number
      } : null
    );
  };

  return (
    <>
      <ParticleBackground />
      <div className="container mx-auto py-8 px-4 relative">
        <Toaster position="top-right" />
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h1 className="text-4xl font-bold text-center md:text-left bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-green-400">
              Task Extractor
            </h1>
            
            <div className="mt-4 md:mt-0">
              <GitHubIntegration
                isGitHubLoggedIn={isGitHubLoggedIn}
                userRepos={userRepos}
                selectedRepo={selectedRepo}
                open={open}
                setOpen={setOpen}
                handleRepoSelect={handleRepoSelect}
                handleGitHubLogin={handleGitHubLogin}
                isProjectsEnabled={isProjectsEnabled}
                userProjects={userProjects}
                selectedProject={selectedProject}
                projectSelectorOpen={projectSelectorOpen}
                setProjectSelectorOpen={setProjectSelectorOpen}
                handleProjectSelect={handleProjectSelect}
              />
            </div>
          </div>
          
          <p className="text-center mb-2 text-white/70">
            Enter your free-form text below and we&apos;ll extract tasks and subtasks for you
          </p>
          
          {isGitHubLoggedIn ? (
            <p className="text-center text-sm text-green-400">
              {selectedProject && isProjectsEnabled ? (
                <>Tasks will be created in project: <span className="font-semibold">{selectedProject.title}</span></>
              ) : selectedRepo ? (
                <>Tasks will be created in repository: <span className="font-semibold">{selectedRepo}</span></>
              ) : null}
            </p>
          ) : (
            <p className="text-center text-sm text-blue-400">
              You can use Task Extractor without signing in, but GitHub authentication enables creating issues directly
            </p>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <TaskInput
            inputText={inputText}
            isProcessing={isProcessing}
            onInputChange={handleInputChange}
            onExtractTasks={handleExtractTasks}
          />

          <TaskOutput
            isProcessing={isProcessing}
            extractedTasks={extractedTasks}
            markdownText={markdownText}
            isGitHubLoggedIn={isGitHubLoggedIn}
            onSubtaskToggle={handleSubtaskToggle}
            onCopyMarkdown={copyMarkdownToClipboard}
            onCreateIssues={handleCreateIssues}
            isCreatingIssues={isCreatingIssues}
            selectedRepo={selectedRepo}
            selectedProject={selectedProject}
          />
        </div>

        {creationResult && creationResult?.success && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 relative z-10 bg-black/20 rounded-xl backdrop-blur-sm"
          >
            <IssuesList
              mainIssue={{ url: creationResult.mainIssueUrl || '' }}
              subtaskIssues={(creationResult.subtaskIssueUrls || []).map(url => ({ url }))}
            />
          </motion.div>
        )}
      </div>
    </>
  );
} 
