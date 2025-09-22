import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Building2, User, Search, Eye, Edit, Mail, Phone, MapPin } from 'lucide-react';
import { Assignment, Company } from '@/types/crm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { StatusBadge } from '@/components/ui/status-badge';

export function AssignmentManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [availableCompanies, setAvailableCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('CONTACT');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingCompany, setViewingCompany] = useState<Company | null>(null);

  const roles = [
    { value: 'CONTACT', label: 'Contact Person' },
    { value: 'COLLABORATOR', label: 'Collaborator' },
    { value: 'REPRESENTATIVE', label: 'Representative' },
    { value: 'CONSULTANT', label: 'Consultant' },
  ];

  useEffect(() => {
    if (user) {
      fetchAssignments();
      fetchCompanies();
    }
  }, [user]);

  const fetchAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select(`
          *,
          profiles:user_id (
            id,
            user_id,
            name,
            role,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user?.id);

      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({
        title: "Error",
        description: "Failed to load assignments",
        variant: "destructive",
      });
    }
  };

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');

      if (error) throw error;
      setCompanies(data || []);
      
      // Filter companies that are not already assigned to the current user
      const { data: assignedCompanies } = await supabase
        .from('assignments')
        .select('company_id')
        .eq('user_id', user?.id);

      const assignedCompanyIds = assignedCompanies?.map(a => a.company_id) || [];
      const available = (data || []).filter(company => !assignedCompanyIds.includes(company.id));
      setAvailableCompanies(available);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({
        title: "Error",
        description: "Failed to load companies",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignToCompany = async () => {
    if (!selectedCompany || !user) return;

    try {
      const { error } = await supabase
        .from('assignments')
        .insert({
          company_id: selectedCompany,
          user_id: user.id,
          role: selectedRole,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Successfully assigned to company",
      });

      setSelectedCompany('');
      setSelectedRole('CONTACT');
      fetchAssignments();
      fetchCompanies(); // Refresh to update available companies
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast({
        title: "Error",
        description: "Failed to create assignment",
        variant: "destructive",
      });
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    try {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Assignment removed successfully",
      });

      fetchAssignments();
      fetchCompanies(); // Refresh to update available companies
    } catch (error) {
      console.error('Error removing assignment:', error);
      toast({
        title: "Error",
        description: "Failed to remove assignment",
        variant: "destructive",
      });
    }
  };

  const getCompanyDetails = (companyId: string) => {
    return companies.find(c => c.id === companyId);
  };

  const getCompanyName = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    return company?.name || 'Unknown Company';
  };

  const getCompanyStatus = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    return company?.status || 'UNKNOWN';
  };

  const handleViewCompany = (companyId: string) => {
    const company = getCompanyDetails(companyId);
    if (company) {
      setViewingCompany(company);
    }
  };

  const handleEditCompany = (companyId: string) => {
    navigate(`/company/${companyId}`);
  };

  const filteredAvailableCompanies = availableCompanies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Assignments</h1>
          <p className="text-muted-foreground">
            Manage your company assignments and roles
          </p>
        </div>
      </div>

      {/* Add New Assignment Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Assign to Company
          </CardTitle>
          <CardDescription>
            Choose a company and your role to create a new assignment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Company</label>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a company" />
                </SelectTrigger>
                <SelectContent>
                  {filteredAvailableCompanies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span>{company.name}</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {company.status}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Role</label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={handleAssignToCompany}
                disabled={!selectedCompany}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Assignment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Current Assignments ({assignments.length})
          </CardTitle>
          <CardDescription>
            Your current company assignments and roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Assignments</h3>
              <p className="text-muted-foreground">
                You haven't been assigned to any companies yet. Use the form above to assign yourself to a company.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment) => {
                const company = getCompanyDetails(assignment.company_id);
                return (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Building2 className="h-8 w-8 text-primary" />
                      <div>
                        <h3 className="font-medium text-foreground">
                          {getCompanyName(assignment.company_id)}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">
                            {assignment.role}
                          </Badge>
                          <Badge variant="outline">
                            {getCompanyStatus(assignment.company_id)}
                          </Badge>
                        </div>
                        {company && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {company.contact_name && (
                              <span>{company.contact_name}</span>
                            )}
                            {company.contact_email && (
                              <span className="ml-2">• {company.contact_email}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Since {new Date(assignment.created_at).toLocaleDateString()}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewCompany(assignment.company_id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCompany(assignment.company_id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Assignment</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove your assignment from "{getCompanyName(assignment.company_id)}"? 
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemoveAssignment(assignment.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {filteredAvailableCompanies.length === 0 && searchTerm && (
        <Card>
          <CardContent className="text-center py-8">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Companies Found</h3>
            <p className="text-muted-foreground">
              No companies match your search criteria. Try a different search term.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Company Information Dialog */}
      <Dialog open={!!viewingCompany} onOpenChange={() => setViewingCompany(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {viewingCompany?.name}
            </DialogTitle>
            <DialogDescription>
              Company details and information
            </DialogDescription>
          </DialogHeader>
          
          {viewingCompany && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Status</h4>
                    <StatusBadge status={viewingCompany.status} />
                  </div>
                  
                  {viewingCompany.contact_name && (
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Contact Person</h4>
                      <p className="text-foreground">{viewingCompany.contact_name}</p>
                    </div>
                  )}
                  
                  {viewingCompany.contact_email && (
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Email</h4>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <p className="text-foreground">{viewingCompany.contact_email}</p>
                      </div>
                    </div>
                  )}
                  
                  {viewingCompany.phone && (
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Phone</h4>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <p className="text-foreground">{viewingCompany.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  {(viewingCompany.booth_number || viewingCompany.booth_location) && (
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Booth Information</h4>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          {viewingCompany.booth_number && (
                            <p className="text-foreground">Booth {viewingCompany.booth_number}</p>
                          )}
                          {viewingCompany.booth_location && (
                            <p className="text-muted-foreground">{viewingCompany.booth_location}</p>
                          )}
                          {viewingCompany.booth_size && (
                            <p className="text-muted-foreground">Size: {viewingCompany.booth_size}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Created</h4>
                    <p className="text-muted-foreground">
                      {new Date(viewingCompany.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Last Updated</h4>
                    <p className="text-muted-foreground">
                      {new Date(viewingCompany.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setViewingCompany(null)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setViewingCompany(null);
                  handleEditCompany(viewingCompany.id);
                }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Company
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
