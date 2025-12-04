import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Building2, Tag, Users, X, Command } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface SearchResult {
  type: 'company' | 'user' | 'tag';
  id: string;
  title: string;
  subtitle?: string;
  status?: string;
  color?: string;
}

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [open]);

  // Search function
  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const searchResults: SearchResult[] = [];

      // Search companies
      const { data: companies } = await supabase
        .from('companies')
        .select('id, name, contact_name, status')
        .or(`name.ilike.%${searchQuery}%,contact_name.ilike.%${searchQuery}%,contact_email.ilike.%${searchQuery}%`)
        .limit(5);

      if (companies) {
        searchResults.push(
          ...companies.map(c => ({
            type: 'company' as const,
            id: c.id,
            title: c.name,
            subtitle: c.contact_name || undefined,
            status: c.status,
          }))
        );
      }

      // Search users
      const { data: users } = await supabase
        .from('profiles')
        .select('id, name, role')
        .ilike('name', `%${searchQuery}%`)
        .limit(3);

      if (users) {
        searchResults.push(
          ...users.map(u => ({
            type: 'user' as const,
            id: u.id,
            title: u.name,
            subtitle: u.role,
          }))
        );
      }

      // Search tags
      const { data: tags } = await supabase
        .from('tags')
        .select('id, name, color')
        .ilike('name', `%${searchQuery}%`)
        .limit(3);

      if (tags) {
        searchResults.push(
          ...tags.map(t => ({
            type: 'tag' as const,
            id: t.id,
            title: t.name,
            color: t.color,
          }))
        );
      }

      setResults(searchResults);
      setSelectedIndex(0);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      search(query);
    }, 200);

    return () => clearTimeout(timer);
  }, [query, search]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        onOpenChange(false);
        break;
    }
  };

  // Handle result selection
  const handleSelect = (result: SearchResult) => {
    onOpenChange(false);
    switch (result.type) {
      case 'company':
        navigate(`/company/${result.id}`);
        break;
      case 'user':
        navigate('/user-statistics');
        break;
      case 'tag':
        navigate('/?tab=tags');
        break;
    }
  };

  // Get icon for result type
  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'company':
        return <Building2 className="h-4 w-4 text-primary" />;
      case 'user':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'tag':
        return <Tag className="h-4 w-4 text-purple-500" />;
    }
  };

  // Get label for result type
  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'company':
        return 'Entreprise';
      case 'user':
        return 'Utilisateur';
      case 'tag':
        return 'Étiquette';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Recherche globale</DialogTitle>
        </DialogHeader>
        
        {/* Search Input */}
        <div className="flex items-center border-b px-3">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Rechercher des entreprises, utilisateurs, étiquettes..."
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            autoFocus
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Results */}
        <div className="max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {query ? 'Aucun résultat trouvé' : 'Commencez à taper pour rechercher...'}
            </div>
          ) : (
            <div className="py-2">
              {results.map((result, index) => (
                <button
                  key={`${result.type}-${result.id}`}
                  className={cn(
                    "w-full px-3 py-2 flex items-center gap-3 text-left hover:bg-muted transition-colors",
                    selectedIndex === index && "bg-muted"
                  )}
                  onClick={() => handleSelect(result)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  {getIcon(result.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground truncate">
                        {result.title}
                      </span>
                      {result.type === 'company' && result.status && (
                        <StatusBadge status={result.status as any} className="text-xs" />
                      )}
                      {result.type === 'tag' && result.color && (
                        <Badge 
                          style={{ backgroundColor: result.color, color: 'white' }}
                          className="text-xs"
                        >
                          {result.title}
                        </Badge>
                      )}
                    </div>
                    {result.subtitle && (
                      <span className="text-xs text-muted-foreground">
                        {result.subtitle}
                      </span>
                    )}
                  </div>
                  <Badge variant="outline" className="shrink-0 text-xs">
                    {getTypeLabel(result.type)}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer with keyboard hints */}
        <div className="flex items-center justify-between px-3 py-2 border-t bg-muted/50 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px]">↑↓</kbd>
              pour naviguer
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px]">↵</kbd>
              pour sélectionner
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px]">Échap</kbd>
            pour fermer
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook for keyboard shortcut
export function useGlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to open search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isOpen,
    setIsOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
}

// Search trigger button for sidebar/header
export function SearchTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="outline"
      className="w-full justify-start text-muted-foreground gap-2 h-9"
      onClick={onClick}
    >
      <Search className="h-4 w-4" />
      <span className="flex-1 text-left text-sm">Rechercher...</span>
      <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
        <Command className="h-3 w-3" />K
      </kbd>
    </Button>
  );
}
