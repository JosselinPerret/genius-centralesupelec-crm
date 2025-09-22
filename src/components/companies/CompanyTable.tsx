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
import { Search, Plus, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';
import { Company } from '@/types/crm';
import { StatusBadge } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
}

export function CompanyTable() {
  const [companies, setCompanies] = useState<CompanyWithTags[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const { data: companiesData, error } = await supabase
        .from('companies')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Load tags for each company
      const companiesWithTags = await Promise.all(
        (companiesData || []).map(async (company) => {
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

          return {
            ...company,
            tags: tagData?.map((ct: any) => ct.tags).filter(Boolean) || []
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

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.contact_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canManageCompanies = profile?.role === 'ADMIN' || profile?.role === 'MANAGER';
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
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
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
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Booth</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      {companies.length === 0 ? 'No companies found. Create your first company to get started.' : 'No companies match your search criteria.'}
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
                        {company.booth_number && (
                          <div className="text-sm">
                            <div className="font-medium text-foreground">{company.booth_number}</div>
                            <div className="text-muted-foreground">{company.booth_location}</div>
                          </div>
                        )}
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
                              View Details
                            </DropdownMenuItem>
                            {canManageCompanies && (
                              <DropdownMenuItem onClick={() => navigate(`/company/${company.id}`)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            )}
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