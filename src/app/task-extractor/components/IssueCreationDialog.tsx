import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { GitHubCredentials } from '@/types/task';

interface IssueCreationDialogProps {
  showDialog: boolean;
  setShowDialog: (show: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  githubCredentials: GitHubCredentials;
  handleGitHubCredentialsChange: (field: keyof GitHubCredentials, value: string) => void;
  handleGitHubLogin: () => void;
  handleCreateIssues: () => void;
  isCreatingIssues: boolean;
}

export function IssueCreationDialog({
  showDialog,
  setShowDialog,
  activeTab,
  setActiveTab,
  githubCredentials,
  handleGitHubCredentialsChange,
  handleGitHubLogin,
  handleCreateIssues,
  isCreatingIssues,
}: IssueCreationDialogProps) {
  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all duration-300"
        >
          Create GitHub Issues
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-black/50 backdrop-blur-xl border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white/90">GitHub Integration</DialogTitle>
          <DialogDescription className="text-white/50">
            Create GitHub issues from your extracted tasks
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-black/30">
            <TabsTrigger value="credentials">Manual Credentials</TabsTrigger>
            <TabsTrigger value="oauth">GitHub Login</TabsTrigger>
          </TabsList>
          
          <TabsContent value="credentials" className="space-y-4 py-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="token" className="text-right text-white/70">
                  Token
                </Label>
                <Input
                  id="token"
                  type="password"
                  value={githubCredentials.token}
                  onChange={(e) => handleGitHubCredentialsChange('token', e.target.value)}
                  className="col-span-3 bg-black/20 border-white/10"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="owner" className="text-right text-white/70">
                  Owner
                </Label>
                <Input
                  id="owner"
                  value={githubCredentials.owner}
                  onChange={(e) => handleGitHubCredentialsChange('owner', e.target.value)}
                  className="col-span-3 bg-black/20 border-white/10"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="repo" className="text-right text-white/70">
                  Repo
                </Label>
                <Input
                  id="repo"
                  value={githubCredentials.repo}
                  onChange={(e) => handleGitHubCredentialsChange('repo', e.target.value)}
                  className="col-span-3 bg-black/20 border-white/10"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="oauth" className="space-y-4 py-4">
            <div className="flex flex-col items-center justify-center py-4">
              <p className="text-sm text-white/50 mb-4">
                Login with GitHub to select repositories and create issues
              </p>
              <Button 
                onClick={handleGitHubLogin}
                className="bg-[#2da44e] hover:bg-[#2c974b]"
              >
                Login with GitHub
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button
            onClick={handleCreateIssues}
            disabled={isCreatingIssues || (activeTab === 'oauth') || (activeTab === 'credentials' && (!githubCredentials.token || !githubCredentials.owner || !githubCredentials.repo))}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
          >
            {isCreatingIssues ? 'Creating...' : 'Create Issues'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
