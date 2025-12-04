import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, MoreHorizontal, Eye, Edit, Trash2, Filter, X, ChevronLeft, ChevronRight, LayoutGrid, List, Building2, Users, Sparkles, ArrowUpRight, Phone, Mail, Calendar } from 'lucide-react';
import { Company } from '@/types/crm';
import { StatusBadge } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { CompanyForm } from './CompanyForm';
import { CsvImport } from './CsvImport';
import { CompanyCard } from './CompanyCard';
import { TableSkeleton, CompanyCardSkeleton } from '@/components/ui/loading-skeletons';
import { EmptyCompanies, EmptySearchResults } from '@/components/ui/empty-state';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';
import { useIsMobile } from '@/hooks/use-mobile';
interface Tag {
  id: string;
  name: string;
  color: string;
}
interface CompanyWithTags extends Company {
  tags?: Tag[];
  assignedUsers?: number;
  hasCurrentUserAssignment?: boolean;
  _matchesFilters?: boolean;
}
type SearchFilters = {
  searchTerm: string;
  status: string;
  tagId: string;
  assignmentFilter: string; // 'all', 'assigned', 'unassigned', 'my-assignments'
};
export function CompanyTable() {
  const [companies, setCompanies] = useState<CompanyWithTags[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    status: 'all',
    tagId: 'all',
    assignmentFilter: 'all'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const itemsPerPage = 20;
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Confirmation dialog for delete
  const deleteDialog = useConfirmDialog({
    title: "Supprimer l'entreprise",
    description: "Êtes-vous sûr de vouloir supprimer cette entreprise ? Cette action est irréversible.",
    confirmLabel: 'Supprimer',
    cancelLabel: 'Annuler',
    variant: 'destructive',
  });
  const {
    profile,
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  useEffect(() => {
    loadCompanies();
    loadTags();

    // Reload data when window gains focus (user comes back from detail page)
    const handleFocus = () => {
      loadCompanies();
      loadTags();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [currentPage, filters]);
  const loadCompanies = async () => {
    try {
      // Build base query
      let query = supabase.from('companies').select('*', {
        count: 'exact'
      });

      // Apply search filter
      if (filters.searchTerm) {
        query = query.or(`name.ilike.%${filters.searchTerm}%,contact_name.ilike.%${filters.searchTerm}%,contact_email.ilike.%${filters.searchTerm}%`);
      }

      // Apply status filter
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status as any);
      }

      // Get count with filters
      const {
        count
      } = await query;
      setTotalCount(count || 0);

      // Check if any filters are active
      const hasFilters = filters.searchTerm !== '' || filters.status !== 'all' || filters.tagId !== 'all' || filters.assignmentFilter !== 'all';

      // Get data with filters - if filters active, get all results, otherwise paginate
      let dataQuery = supabase.from('companies').select('*');

      // Apply same filters
      if (filters.searchTerm) {
        dataQuery = dataQuery.or(`name.ilike.%${filters.searchTerm}%,contact_name.ilike.%${filters.searchTerm}%,contact_email.ilike.%${filters.searchTerm}%`);
      }
      if (filters.status !== 'all') {
        dataQuery = dataQuery.eq('status', filters.status as any);
      }

      // Apply pagination only if no filters
      if (!hasFilters) {
        const from = (currentPage - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;
        dataQuery = dataQuery.range(from, to);
      }
      const {
        data: companiesData,
        error
      } = await dataQuery.order('updated_at', {
        ascending: false
      });
      if (error) throw error;

      // Load tags for each company and assignment counts
      const companiesWithTags = await Promise.all((companiesData || []).map(async company => {
        // Load tags
        const {
          data: tagData
        } = await supabase.from('company_tags').select(`
              tags:tag_id (
                id,
                name,
                color
              )
            `).eq('company_id', company.id);

        // Load assignment count and check if current user is assigned
        const {
          data: assignmentData
        } = await supabase.from('assignments').select('user_id').eq('company_id', company.id);
        const assignedUsers = assignmentData?.length || 0;
        const hasCurrentUserAssignment = user ? assignmentData?.some(a => a.user_id === user.id) || false : false;

        // Apply tag filter
        const companyTags = tagData?.map((ct: any) => ct.tags).filter(Boolean) || [];
        const matchesTag = filters.tagId === 'all' || companyTags.some(tag => tag.id === filters.tagId);

        // Apply assignment filter
        let matchesAssignment = true;
        switch (filters.assignmentFilter) {
          case 'assigned':
            matchesAssignment = assignedUsers > 0;
            break;
          case 'unassigned':
            matchesAssignment = assignedUsers === 0;
            break;
          case 'my-assignments':
            matchesAssignment = hasCurrentUserAssignment;
            break;
          default:
            matchesAssignment = true;
        }
        return {
          ...company,
          tags: companyTags,
          assignedUsers,
          hasCurrentUserAssignment,
          _matchesFilters: matchesTag && matchesAssignment
        };
      }));

      // Filter out companies that don't match tag/assignment filters
      const filteredCompanies = companiesWithTags.filter(c => c._matchesFilters);
      setCompanies(filteredCompanies);
    } catch (error) {
      console.error('Error loading companies:', error);
      toast({
        title: "Erreur",
        description: "Échec du chargement des entreprises",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const loadTags = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('tags').select('*').order('name');
      if (error) throw error;
      setAllTags(data || []);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };
  const handleCreateCompany = async (formData: any, tagIds: string[]) => {
    try {
      const {
        data: company,
        error
      } = await supabase.from('companies').insert(formData).select().single();
      if (error) throw error;

      // Add tags if any
      if (tagIds.length > 0) {
        const tagInserts = tagIds.map(tagId => ({
          company_id: company.id,
          tag_id: tagId
        }));
        await supabase.from('company_tags').insert(tagInserts);
      }
      setIsAdding(false);
      loadCompanies();
      toast({
        title: "Entreprise créée",
        description: "L'entreprise a été créée avec succès."
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const handleDeleteCompany = (companyId: string) => {
    deleteDialog.confirm(async () => {
      try {
        const { error } = await supabase.from('companies').delete().eq('id', companyId);
        if (error) throw error;
        loadCompanies();
        toast({
          title: "Entreprise supprimée",
          description: "L'entreprise a été supprimée avec succès."
        });
      } catch (error: any) {
        toast({
          title: "Erreur",
          description: error.message,
          variant: "destructive"
        });
      }
    });
  };

  // Companies are already filtered server-side
  const filteredCompanies = companies;
  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      status: 'all',
      tagId: 'all',
      assignmentFilter: 'all'
    });
    setCurrentPage(1);
  };
  const hasActiveFilters = filters.searchTerm !== '' || filters.status !== 'all' || filters.tagId !== 'all' || filters.assignmentFilter !== 'all';
  const canManageCompanies = true; // Everyone can manage companies now
  const canDeleteCompanies = profile?.role === 'ADMIN';
  // Use card view on mobile by default
  const effectiveViewMode = isMobile ? 'cards' : viewMode;

  if (isAdding) {
    return <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Ajouter une entreprise</h1>
          </div>
        </div>
        <CompanyForm onSubmit={handleCreateCompany} onCancel={() => setIsAdding(false)} />
      </div>;
  }
  return <>
      <CsvImport onImportComplete={loadCompanies} />
      
      {/* Header moderne */}
      <div className="mb-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-primary to-accent rounded-xl shadow-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Entreprises</h1>
              <p className="text-muted-foreground text-sm">
                {totalCount} entreprise{totalCount !== 1 ? 's' : ''} au total
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* View mode toggle - hidden on mobile */}
            {!isMobile && (
              <div className="flex items-center bg-muted/50 rounded-xl p-1">
                <Button 
                  variant={viewMode === 'table' ? 'default' : 'ghost'} 
                  size="sm" 
                  className={`rounded-lg transition-all ${viewMode === 'table' ? 'shadow-md' : ''}`}
                  onClick={() => setViewMode('table')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button 
                  variant={viewMode === 'cards' ? 'default' : 'ghost'} 
                  size="sm" 
                  className={`rounded-lg transition-all ${viewMode === 'cards' ? 'shadow-md' : ''}`}
                  onClick={() => setViewMode('cards')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
            )}
            {canManageCompanies && (
              <Button 
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 rounded-xl" 
                onClick={() => setIsAdding(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Ajouter une entreprise</span>
                <span className="sm:hidden">Ajouter</span>
              </Button>
            )}
          </div>
        </div>
        
        {/* Barre de recherche et filtres */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Rechercher des entreprises..." 
              value={filters.searchTerm} 
              onChange={e => {
                setFilters(prev => ({
                  ...prev,
                  searchTerm: e.target.value
                }));
                setCurrentPage(1);
              }} 
              className="pl-11 h-11 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm focus:bg-background transition-all" 
            />
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2 h-11 rounded-xl border-border/50 hover:bg-primary/5 hover:border-primary/30 transition-all">
                <Filter className="h-4 w-4" />
                Filtres
                {hasActiveFilters && (
                  <span className="ml-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                    {[filters.searchTerm, filters.status !== 'all', filters.tagId !== 'all', filters.assignmentFilter !== 'all'].filter(Boolean).length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 rounded-xl border-border/50 shadow-xl" align="start">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-foreground">Filtres</h4>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4 mr-1" />
                      Effacer tout
                    </Button>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block text-foreground">Statut</label>
                    <Select value={filters.status} onValueChange={value => {
                      setFilters(prev => ({
                        ...prev,
                        status: value
                      }));
                      setCurrentPage(1);
                    }}>
                      <SelectTrigger className="rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        <SelectItem value="NOT_TO_CONTACT">N'est pas à démarcher</SelectItem>
                        <SelectItem value="TO_CONTACT">A démarcher</SelectItem>
                        <SelectItem value="CONTACTED">Contacté</SelectItem>
                        <SelectItem value="FIRST_FOLLOWUP">1ère relance</SelectItem>
                        <SelectItem value="SECOND_FOLLOWUP">2e relance</SelectItem>
                        <SelectItem value="THIRD_FOLLOWUP">3e relance</SelectItem>
                        <SelectItem value="IN_DISCUSSION">En discussion</SelectItem>
                        <SelectItem value="COMING">Vient</SelectItem>
                        <SelectItem value="NOT_COMING">Ne vient pas</SelectItem>
                        <SelectItem value="NEXT_YEAR">Année prochaine</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block text-foreground">Étiquette</label>
                    <Select value={filters.tagId} onValueChange={value => {
                      setFilters(prev => ({
                        ...prev,
                        tagId: value
                      }));
                      setCurrentPage(1);
                    }}>
                      <SelectTrigger className="rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="all">Toutes les étiquettes</SelectItem>
                        {allTags.map(tag => (
                          <SelectItem key={tag.id} value={tag.id}>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: tag.color }} />
                              {tag.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block text-foreground">Assignations</label>
                    <Select value={filters.assignmentFilter} onValueChange={value => {
                      setFilters(prev => ({
                        ...prev,
                        assignmentFilter: value
                      }));
                      setCurrentPage(1);
                    }}>
                      <SelectTrigger className="rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="all">Toutes les entreprises</SelectItem>
                        <SelectItem value="assigned">Avec assignations</SelectItem>
                        <SelectItem value="unassigned">Sans assignations</SelectItem>
                        <SelectItem value="my-assignments">Mes assignations</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        {/* Filtres actifs */}
        {hasActiveFilters && (
          <div className="flex items-center flex-wrap gap-2 mt-4 animate-fade-in">
            {filters.searchTerm && (
              <Badge variant="secondary" className="rounded-lg px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer transition-colors" onClick={() => setFilters(prev => ({ ...prev, searchTerm: '' }))}>
                <Search className="h-3 w-3 mr-1" />
                "{filters.searchTerm}"
                <X className="h-3 w-3 ml-1" />
              </Badge>
            )}
            {filters.status !== 'all' && (
              <Badge variant="secondary" className="rounded-lg px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer transition-colors" onClick={() => setFilters(prev => ({ ...prev, status: 'all' }))}>
                Statut : {filters.status}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            )}
            {filters.tagId !== 'all' && (
              <Badge variant="secondary" className="rounded-lg px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer transition-colors" onClick={() => setFilters(prev => ({ ...prev, tagId: 'all' }))}>
                Étiquette : {allTags.find(t => t.id === filters.tagId)?.name}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            )}
            {filters.assignmentFilter !== 'all' && (
              <Badge variant="secondary" className="rounded-lg px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer transition-colors" onClick={() => setFilters(prev => ({ ...prev, assignmentFilter: 'all' }))}>
                {filters.assignmentFilter === 'assigned' && 'Avec assignations'}
                {filters.assignmentFilter === 'unassigned' && 'Sans assignations'}
                {filters.assignmentFilter === 'my-assignments' && 'Mes assignations'}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            )}
          </div>
        )}
      </div>
      
      {/* Contenu principal */}
      <Card className="shadow-lg border-border/50 rounded-2xl overflow-hidden">
        <CardContent className="p-0">
        {/* Loading state */}
        {isLoading ? (
          <div className="p-6">
            {effectiveViewMode === 'cards' ? (
              <CompanyCardSkeleton count={6} />
            ) : (
              <TableSkeleton rows={5} columns={7} />
            )}
          </div>
        ) : filteredCompanies.length === 0 ? (
          /* Empty state */
          <div className="p-6">
            {companies.length === 0 ? (
              <EmptyCompanies onAdd={() => setIsAdding(true)} />
            ) : (
              <EmptySearchResults onClear={clearFilters} />
            )}
          </div>
        ) : effectiveViewMode === 'cards' ? (
          /* Card view */
          <div className="p-6 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCompanies.map((company, index) => (
              <div key={company.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                <CompanyCard 
                  company={company}
                  canDelete={canDeleteCompanies}
                  onDelete={handleDeleteCompany}
                />
              </div>
            ))}
          </div>
        ) : (
          /* Table view moderne */
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/50">
                  <TableHead className="font-semibold text-foreground">Entreprise</TableHead>
                  <TableHead className="hidden md:table-cell font-semibold text-foreground">Contact</TableHead>
                  <TableHead className="font-semibold text-foreground">Statut</TableHead>
                  <TableHead className="hidden lg:table-cell font-semibold text-foreground">Étiquettes</TableHead>
                  <TableHead className="hidden md:table-cell font-semibold text-foreground">Assignations</TableHead>
                  <TableHead className="hidden sm:table-cell font-semibold text-foreground">Modifié</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map((company, index) => (
                  <TableRow 
                    key={company.id} 
                    className="group cursor-pointer border-b border-border/30 hover:bg-primary/5 transition-all duration-200 animate-fade-in" 
                    style={{ animationDelay: `${index * 30}ms` }}
                    onClick={() => navigate(`/company/${company.id}`)}
                  >
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary font-semibold text-sm group-hover:from-primary/30 group-hover:to-accent/30 transition-all">
                          {company.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                            {company.name}
                            <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          {company.phone && (
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {company.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {company.contact_name ? (
                        <div>
                          <div className="font-medium text-foreground">{company.contact_name}</div>
                          {company.contact_email && (
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {company.contact_email}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={company.status} />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1.5">
                        {company.tags?.slice(0, 2).map(tag => (
                          <Badge 
                            key={tag.id} 
                            className="rounded-lg text-xs font-medium shadow-sm"
                            style={{ backgroundColor: tag.color, color: 'white' }}
                          >
                            {tag.name}
                          </Badge>
                        ))}
                        {(company.tags?.length || 0) > 2 && (
                          <Badge variant="secondary" className="rounded-lg text-xs">
                            +{(company.tags?.length || 0) - 2}
                          </Badge>
                        )}
                        {!company.tags?.length && <span className="text-muted-foreground text-sm">—</span>}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        {company.assignedUsers && company.assignedUsers > 0 ? (
                          <Badge variant="secondary" className="rounded-lg bg-muted/50 hover:bg-muted">
                            <Users className="h-3 w-3 mr-1" />
                            {company.assignedUsers}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                        {company.hasCurrentUserAssignment && (
                          <Badge className="rounded-lg bg-primary/10 text-primary hover:bg-primary/20 border-0">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Vous
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(company.updated_at).toLocaleDateString('fr-FR')}
                      </div>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg hover:bg-muted">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl border-border/50 shadow-lg">
                          <DropdownMenuItem onClick={() => navigate(`/company/${company.id}`)} className="rounded-lg cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" />
                            Voir les détails
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/company/${company.id}`)} className="rounded-lg cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          {canDeleteCompanies && (
                            <DropdownMenuItem 
                              className="text-destructive rounded-lg cursor-pointer focus:text-destructive focus:bg-destructive/10" 
                              onClick={() => handleDeleteCompany(company.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        {/* Pagination moderne */}
        {!isLoading && !hasActiveFilters && totalCount > itemsPerPage && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-border/50 bg-muted/20">
            <p className="text-sm text-muted-foreground text-center sm:text-left">
              <span className="font-medium text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span>
              {' à '}
              <span className="font-medium text-foreground">{Math.min(currentPage * itemsPerPage, totalCount)}</span>
              {' sur '}
              <span className="font-medium text-foreground">{totalCount}</span>
              {' entreprises'}
            </p>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                disabled={currentPage === 1}
                className="rounded-lg border-border/50 hover:bg-primary/5 hover:border-primary/30 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Précédent</span>
              </Button>
              <div className="flex items-center gap-1 px-3">
                {Array.from({ length: Math.min(5, Math.ceil(totalCount / itemsPerPage)) }, (_, i) => {
                  const totalPages = Math.ceil(totalCount / itemsPerPage);
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 p-0 rounded-lg ${currentPage === pageNum ? 'shadow-md' : ''}`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(totalCount / itemsPerPage), p + 1))} 
                disabled={currentPage >= Math.ceil(totalCount / itemsPerPage)}
                className="rounded-lg border-border/50 hover:bg-primary/5 hover:border-primary/30 disabled:opacity-40"
              >
                <span className="hidden sm:inline mr-1">Suivant</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        {!isLoading && hasActiveFilters && (
          <div className="p-4 border-t border-border/50 bg-muted/20">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{filteredCompanies.length}</span>
              {' entreprise'}{filteredCompanies.length !== 1 ? 's' : ''}{' trouvée'}{filteredCompanies.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
    {deleteDialog.dialog}
    </>;
}