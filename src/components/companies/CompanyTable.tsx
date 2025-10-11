import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, MoreHorizontal, Eye, Edit, Trash2, Filter, X } from 'lucide-react';
import { Company } from '@/types/crm';
import { StatusBadge } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { CompanyForm } from './CompanyForm';

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface CompanyWithTags extends Company {
  tags?: Tag[];
  assignedUsers?: number;
  hasCurrentUserAssignment?: boolean;
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
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const { toast } = useToast();

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
  }, []);

  const loadCompanies = async () => {
    try {
      const { data: companiesData, error } = await supabase
        .from('companies')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Load tags for each company and assignment counts
      const companiesWithTags = await Promise.all(
        (companiesData || []).map(async (company) => {
          // Load tags
          const { data: tagData } = await supabase
            .from('company_tags')
            .select(`
              tags:tag_id (
                id,
                name,
                color
              )
            `)
            .eq('company_id', company.id);

          // Load assignment count and check if current user is assigned
          const { data: assignmentData } = await supabase
            .from('assignments')
            .select('user_id')
            .eq('company_id', company.id);

          const assignedUsers = assignmentData?.length || 0;
          const hasCurrentUserAssignment = user ? 
            assignmentData?.some(a => a.user_id === user.id) || false : false;

          return {
            ...company,
            tags: tagData?.map((ct: any) => ct.tags).filter(Boolean) || [],
            assignedUsers,
            hasCurrentUserAssignment
          };
        })
      );

      setCompanies(companiesWithTags);
    } catch (error) {
      console.error('Error loading companies:', error);
      toast({
        title: "Error",
        description: "Failed to load companies",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadTags = async () => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name');

      if (error) throw error;
      setAllTags(data || []);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const handleCreateCompany = async (formData: any, tagIds: string[]) => {
    try {
      const { data: company, error } = await supabase
        .from('companies')
        .insert(formData)
        .select()
        .single();

      if (error) throw error;

      // Add tags if any
      if (tagIds.length > 0) {
        const tagInserts = tagIds.map(tagId => ({
          company_id: company.id,
          tag_id: tagId,
        }));
        
        await supabase
          .from('company_tags')
          .insert(tagInserts);
      }

      setIsAdding(false);
      loadCompanies();
      
      toast({
        title: "Company created",
        description: "The company has been created successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteCompany = async (companyId: string) => {
    if (!confirm('Are you sure you want to delete this company? This action cannot be undone.')) return;
    
    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', companyId);

      if (error) throw error;

      loadCompanies();
      
      toast({
        title: "Company deleted",
        description: "The company has been deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredCompanies = companies.filter(company => {
    // Search term filter
    const matchesSearch = !filters.searchTerm || 
      company.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      company.contact_name?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      company.contact_email?.toLowerCase().includes(filters.searchTerm.toLowerCase());

    // Status filter
    const matchesStatus = filters.status === 'all' || company.status === filters.status;

    // Tag filter
    const matchesTag = filters.tagId === 'all' || 
      company.tags?.some(tag => tag.id === filters.tagId);

    // Assignment filter
    let matchesAssignment = true;
    switch (filters.assignmentFilter) {
      case 'assigned':
        matchesAssignment = company.assignedUsers > 0;
        break;
      case 'unassigned':
        matchesAssignment = company.assignedUsers === 0;
        break;
      case 'my-assignments':
        matchesAssignment = company.hasCurrentUserAssignment;
        break;
      default:
        matchesAssignment = true;
    }

    return matchesSearch && matchesStatus && matchesTag && matchesAssignment;
  });

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      status: 'all',
      tagId: 'all',
      assignmentFilter: 'all'
    });
  };

  const hasActiveFilters = filters.searchTerm !== '' || 
    filters.status !== 'all' || 
    filters.tagId !== 'all' || 
    filters.assignmentFilter !== 'all';

  const canManageCompanies = true; // Everyone can manage companies now
  const canDeleteCompanies = profile?.role === 'ADMIN';

  if (isAdding) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Add Company</h1>
        </div>
        <CompanyForm
          onSubmit={handleCreateCompany}
          onCancel={() => setIsAdding(false)}
        />
      </div>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Companies</CardTitle>
          {canManageCompanies && (
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={() => setIsAdding(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Company
            </Button>
          )}
        </div>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search companies..."
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="pl-9"
              />
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filtres
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                      !
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="start">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Filtres</h4>
                    {hasActiveFilters && (
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        <X className="h-4 w-4 mr-1" />
                        Effacer
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Statut</label>
                      <Select
                        value={filters.status}
                        onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
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
                      <label className="text-sm font-medium mb-2 block">Étiquette</label>
                      <Select
                        value={filters.tagId}
                        onValueChange={(value) => setFilters(prev => ({ ...prev, tagId: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toutes les étiquettes</SelectItem>
                          {allTags.map((tag) => (
                            <SelectItem key={tag.id} value={tag.id}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: tag.color }}
                                />
                                {tag.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Assignations</label>
                      <Select
                        value={filters.assignmentFilter}
                        onValueChange={(value) => setFilters(prev => ({ ...prev, assignmentFilter: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
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
          
          {hasActiveFilters && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Filtres actifs :</span>
              {filters.searchTerm && (
                <Badge variant="secondary">Recherche : "{filters.searchTerm}"</Badge>
              )}
              {filters.status !== 'all' && (
                <Badge variant="secondary">Statut : {filters.status}</Badge>
              )}
              {filters.tagId !== 'all' && (
                <Badge variant="secondary">
                  Étiquette : {allTags.find(t => t.id === filters.tagId)?.name}
                </Badge>
              )}
              {filters.assignmentFilter !== 'all' && (
                <Badge variant="secondary">
                  {filters.assignmentFilter === 'assigned' && 'Avec assignations'}
                  {filters.assignmentFilter === 'unassigned' && 'Sans assignations'}
                  {filters.assignmentFilter === 'my-assignments' && 'Mes assignations'}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Entreprise</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Étiquettes</TableHead>
                  <TableHead>Assignations</TableHead>
                  <TableHead>Modifié</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      {companies.length === 0 ? 'Aucune entreprise trouvée. Créez votre première entreprise pour commencer.' : 'Aucune entreprise ne correspond à vos critères de recherche.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCompanies.map((company) => (
                    <TableRow key={company.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <div className="font-medium text-foreground">{company.name}</div>
                          {company.phone && (
                            <div className="text-sm text-muted-foreground">{company.phone}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {company.contact_name && (
                          <div>
                            <div className="font-medium text-foreground">{company.contact_name}</div>
                            {company.contact_email && (
                              <div className="text-sm text-muted-foreground">{company.contact_email}</div>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={company.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {company.tags?.slice(0, 2).map((tag) => (
                            <Badge key={tag.id} style={{ backgroundColor: tag.color, color: 'white' }}>
                              {tag.name}
                            </Badge>
                          ))}
                          {(company.tags?.length || 0) > 2 && (
                            <span className="text-xs text-muted-foreground">
                              +{(company.tags?.length || 0) - 2} more
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {company.assignedUsers > 0 ? (
                            <Badge variant="secondary">
                              {company.assignedUsers} user{company.assignedUsers !== 1 ? 's' : ''}
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">No assignments</span>
                          )}
                          {company.hasCurrentUserAssignment && (
                            <Badge variant="outline" className="text-primary border-primary">
                              Vous
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(company.updated_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/company/${company.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Voir les détails
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/company/${company.id}`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            {canDeleteCompanies && (
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleDeleteCompany(company.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}