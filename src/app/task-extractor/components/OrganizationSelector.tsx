import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, Building2, RotateCcw, User } from 'lucide-react';
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { motion } from 'framer-motion';
import { Organization } from '../hooks/useRepositories';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface OrganizationSelectorProps {
  organizations: Organization[];
  selectedOrg: string | null;
  orgSelectorOpen: boolean;
  setOrgSelectorOpen: (open: boolean) => void;
  handleOrgSelect: (orgLogin: string | null) => void;
  isLoading: boolean;
  refreshRepositories: () => void;
}

export function OrganizationSelector({
  organizations,
  selectedOrg,
  orgSelectorOpen,
  setOrgSelectorOpen,
  handleOrgSelect,
  isLoading,
  refreshRepositories
}: OrganizationSelectorProps) {
  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  // Get display name for the currently selected organization or user
  const getSelectedDisplayName = () => {
    if (!selectedOrg) return 'Personal Repositories';
    const org = organizations.find(o => o.login === selectedOrg);
    return org?.name || org?.login || selectedOrg;
  };

  return (
    <motion.div 
      variants={itemVariants}
      className="w-full sm:flex-1 flex items-center gap-2"
    >
      <Popover open={orgSelectorOpen} onOpenChange={setOrgSelectorOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={orgSelectorOpen}
            className={cn(
              "w-full sm:max-w-[280px] justify-between text-base relative group transition-all duration-300 bg-white/5 border-white/10 hover:bg-white/10"
            )}
          >
            <div className="flex items-center">
              {selectedOrg ? (
                <Building2 className="mr-2 h-4 w-4 text-blue-400" />
              ) : (
                <User className="mr-2 h-4 w-4 text-white/80" />
              )}
              <span className="truncate mr-2 max-w-[200px] text-white/90">
                {getSelectedDisplayName()}
              </span>
            </div>
            <ChevronsUpDown className="h-5 w-5 shrink-0 opacity-50 flex-none text-white/70" />
            
            {/* Gradient border effect on hover */}
            <span className="absolute inset-x-0 -bottom-px h-px w-full bg-gradient-to-r from-transparent via-blue-500/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0 bg-black/80 backdrop-blur-xl border-blue-800/30 shadow-lg shadow-blue-900/20">
          <Command className="bg-transparent">
            <CommandInput placeholder="Search organizations..." className="text-base py-3 text-white/80 border-b border-white/10" />
            <CommandList className="max-h-[300px]">
              <CommandEmpty>
                <p className="py-4 text-center text-white/50">No organizations found.</p>
              </CommandEmpty>
              <CommandGroup heading="Personal">
                <CommandItem
                  value="personal"
                  className="cursor-pointer relative hover:bg-blue-950/30 data-[disabled='false']:pointer-events-auto py-2.5 text-base"
                  onSelect={() => handleOrgSelect(null)}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="flex items-center">
                      <User className="mr-2 h-4 w-4 text-white/70" />
                      <span className="text-white/80">Personal Repositories</span>
                    </span>
                    <Check
                      className={cn(
                        "ml-auto h-5 w-5 text-blue-400",
                        selectedOrg === null ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </div>
                </CommandItem>
              </CommandGroup>

              {organizations.length > 0 && (
                <>
                  <CommandSeparator className="bg-white/10 my-2" />
                  <CommandGroup heading="Organizations">
                    {organizations.map((org) => (
                      <CommandItem
                        key={org.login}
                        value={org.login}
                        className="cursor-pointer relative hover:bg-blue-950/30 data-[disabled='false']:pointer-events-auto py-2.5 text-base"
                        onSelect={() => handleOrgSelect(org.login)}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="flex items-center">
                            <div className="w-5 h-5 rounded-sm mr-2 overflow-hidden bg-white/10 flex items-center justify-center">
                              {org.avatarUrl ? (
                                <img 
                                  src={org.avatarUrl} 
                                  alt={org.login}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Building2 className="h-3 w-3 text-white/70" />
                              )}
                            </div>
                            <span className="text-white/80">{org.name || org.login}</span>
                          </span>
                          <Check
                            className={cn(
                              "ml-auto h-5 w-5 text-blue-400",
                              selectedOrg === org.login ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline" 
              size="icon"
              onClick={refreshRepositories}
              disabled={isLoading}
              className="h-10 w-10 bg-white/5 border-white/10 hover:bg-white/10"
            >
              <RotateCcw className={cn(
                "h-4 w-4 text-white/70",
                isLoading && "animate-spin"
              )} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Refresh repositories</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </motion.div>
  );
} 
