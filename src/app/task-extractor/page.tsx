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
import ParticleBackground from '@/components/ParticleBackground';
import IssuesList from '@/components/IssuesList';
import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';

export default function TaskExtractor() {
  // Refs for scrolling
  const inputRef = useRef<HTMLDivElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  
  // Custom hooks
  const { isGitHubLoggedIn } = useGitHubAuth();
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
    detailLevel,
    setCreationResult,
    handleInputChange,
    handleDetailLevelChange,
    handleExtractTasks,
    handleSubtaskToggle,
    copyMarkdownToClipboard,
  } = useTaskExtraction();
  const {
    isCreatingIssues,
    handleCreateGitHubIssues,
  } = useGitHubIssues(setCreationResult);

  // Scroll to output when tasks are extracted
  useEffect(() => {
    if (extractedTasks && outputRef.current) {
      outputRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [extractedTasks]);

  const scrollToTop = () => {
    inputRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
      <div className="max-w-4xl mx-auto py-6 px-4 relative flex flex-col min-h-screen">
        <Toaster position="top-right" />
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <p className="text-center mb-4 text-white/70 text-lg">
            Enter your free-form text below and we&apos;ll extract tasks and subtasks for you
          </p>
          
          {isGitHubLoggedIn && (selectedRepo || selectedProject) && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="w-full mb-2 flex justify-center"
            >
              <div className="bg-gradient-to-r from-black/30 via-green-950/20 to-black/30 backdrop-blur-sm 
                            border border-green-500/30 rounded-lg px-6 py-3 
                            flex items-center justify-center max-w-2xl">
                <div className="bg-green-500 rounded-full w-3 h-3 mr-3 animate-pulse"></div>
                <p className="text-center font-medium">
                  {selectedProject ? (
                    <span className="flex items-center gap-1.5">
                      Tasks will be created in project: 
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-300 font-semibold">
                        {selectedProject.title}
                      </span>
                    </span>
                  ) : selectedRepo ? (
                    <span className="flex items-center gap-1.5">
                      Tasks will be created in repository: 
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-300 font-semibold">
                        {selectedRepo}
                      </span>
                    </span>
                  ) : null}
                </p>
              </div>
            </motion.div>
          )}
          
          {!isGitHubLoggedIn && (
            <p className="text-center text-sm text-blue-400 mb-2">
              You can use Task Extractor without signing in, but GitHub authentication enables creating issues directly
            </p>
          )}
        </motion.div>

        <div className="flex flex-col space-y-8">
          {/* Input Section */}
          <div ref={inputRef}>
            <TaskInput
              inputText={inputText}
              isProcessing={isProcessing}
              detailLevel={detailLevel}
              isGitHubLoggedIn={isGitHubLoggedIn}
              userRepos={userRepos}
              selectedRepo={selectedRepo}
              open={open}
              setOpen={setOpen}
              handleRepoSelect={handleRepoSelect}
              isProjectsEnabled={isProjectsEnabled}
              userProjects={userProjects}
              selectedProject={selectedProject}
              projectSelectorOpen={projectSelectorOpen}
              setProjectSelectorOpen={setProjectSelectorOpen}
              handleProjectSelect={handleProjectSelect}
              onInputChange={handleInputChange}
              onDetailLevelChange={handleDetailLevelChange}
              onExtractTasks={handleExtractTasks}
            />
          </div>

          {/* Output Section */}
          {(extractedTasks || isProcessing) && (
            <motion.div 
              ref={outputRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              {/* Back to top button */}
              <div className="absolute -top-8 left-0 z-10">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/60 hover:text-white/90 hover:bg-black/20 transition-colors"
                  onClick={scrollToTop}
                >
                  <ArrowUp className="w-3.5 h-3.5 mr-1.5" /> 
                  <span className="text-xs">Back to Input</span>
                </Button>
              </div>
              
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
            </motion.div>
          )}

          {creationResult && creationResult?.success && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative z-10 bg-black/20 rounded-xl backdrop-blur-sm"
            >
              <IssuesList
                mainIssue={{ url: creationResult.mainIssueUrl || '' }}
                subtaskIssues={(creationResult.subtaskIssueUrls || []).map(url => ({ url }))}
              />
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
} 
