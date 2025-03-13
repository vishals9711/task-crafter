'use client';
import { motion } from 'framer-motion';
import { Toaster } from 'sonner';
import { useGitHubAuth } from './hooks/useGitHubAuth';
import { useRepositories } from './hooks/useRepositories';
import { useGitHubProjects } from './hooks/useGitHubProjects';
import { useTaskExtraction } from './hooks/useTaskExtraction';
import { useGitHubIssues } from './hooks/useGitHubIssues';
import { useUsageLimit } from './hooks/useUsageLimit';
import { TaskInput } from './components/TaskInput';
import { TaskOutput } from './components/TaskOutput';
import ParticleBackground from '@/components/ParticleBackground';
import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';
import UsageLimitBanner from './components/UsageLimitBanner';

export default function TaskExtractor() {
  // Refs for scrolling
  const inputRef = useRef<HTMLDivElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  
  // Custom hooks
  const { 
    isGitHubLoggedIn, 
    refreshGitHubAuth, 
    reauthenticateWithRepoSelection, 
    handleGitHubLogin 
  } = useGitHubAuth();
  
  const { 
    userRepos, 
    organizations,
    selectedRepo, 
    selectedOrg,
    open, 
    orgSelectorOpen,
    setOpen, 
    setOrgSelectorOpen,
    handleRepoSelect,
    handleOrgSelect,
    isLoading,
    refreshRepositories
  } = useRepositories(isGitHubLoggedIn);
  
  const {
    userProjects,
    selectedProject,
    projectSelectorOpen,
    setProjectSelectorOpen,
    handleProjectSelect,
    isProjectsEnabled,
  } = useGitHubProjects(isGitHubLoggedIn);
  
  // Usage limit hook
  const {
    hasReachedLimit,
    remainingUses,
    incrementUsage
  } = useUsageLimit(isGitHubLoggedIn);
  
  const {
    inputText,
    extractedTasks,
    isProcessing,
    markdownText,
    setCreationResult,
    detailLevel,
    handleInputChange,
    handleDetailLevelChange,
    handleExtractTasks,
    handleSubtaskToggle,
    copyMarkdownToClipboard,
  } = useTaskExtraction(isGitHubLoggedIn, hasReachedLimit, incrementUsage);
  
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
            Enter a description of your work, and Task Crafter will extract a structured task with subtasks.
          </p>
        </motion.div>

        {/* Display the usage limit banner only for non-authenticated users */}
        {!isGitHubLoggedIn && (
          <UsageLimitBanner
            remainingUses={remainingUses}
            hasReachedLimit={hasReachedLimit}
            onLoginClick={handleGitHubLogin}
          />
        )}
        
        <div ref={inputRef}>
          <TaskInput
            inputText={inputText}
            isProcessing={isProcessing}
            detailLevel={detailLevel}
            isGitHubLoggedIn={isGitHubLoggedIn}
            userRepos={userRepos}
            organizations={organizations}
            selectedRepo={selectedRepo}
            selectedOrg={selectedOrg}
            open={open}
            orgSelectorOpen={orgSelectorOpen}
            setOpen={setOpen}
            setOrgSelectorOpen={setOrgSelectorOpen}
            handleRepoSelect={handleRepoSelect}
            handleOrgSelect={handleOrgSelect}
            isProjectsEnabled={isProjectsEnabled}
            userProjects={userProjects}
            selectedProject={selectedProject}
            projectSelectorOpen={projectSelectorOpen}
            setProjectSelectorOpen={setProjectSelectorOpen}
            handleProjectSelect={handleProjectSelect}
            isLoading={isLoading}
            refreshRepositories={refreshRepositories}
            refreshGitHubAuth={refreshGitHubAuth}
            reauthenticateWithRepoSelection={reauthenticateWithRepoSelection}
            onInputChange={handleInputChange}
            onDetailLevelChange={handleDetailLevelChange}
            onExtractTasks={handleExtractTasks}
            disabled={!isGitHubLoggedIn && hasReachedLimit}
          />
        </div>

        {extractedTasks && (
          <div ref={outputRef}>
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
        )}

        {extractedTasks && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="fixed bottom-6 right-6"
          >
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full shadow-lg w-12 h-12 bg-gradient-to-r from-blue-600/80 to-indigo-600/80 backdrop-blur-sm border border-white/10 hover:from-blue-600 hover:to-indigo-600"
              onClick={scrollToTop}
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </div>
    </>
  );
} 
