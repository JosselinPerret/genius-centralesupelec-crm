import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, MapPin, Phone, Mail, Calendar, User, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { StatusBadge } from '@/components/ui/status-badge';
import { NotesSection } from '@/components/notes/NotesSection';
import { CompanyEditDialog } from '@/components/companies/CompanyEditDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { PageLayout } from '@/components/layout/PageLayout';

interface Company {
  id: string;
  name: string;
  contact_name?: string;
  contact_email?: string;
  phone?: string;
  status: 'NOT_TO_CONTACT' | 'TO_CONTACT' | 'CONTACTED' | 'FIRST_FOLLOWUP' | 'SECOND_FOLLOWUP' | 'THIRD_FOLLOWUP' | 'IN_DISCUSSION' | 'COMING' | 'NOT_COMING' | 'NEXT_YEAR';
  booth_number?: string;
  booth_location?: string;
  booth_size?: string;
  created_at: string;
  updated_at: string;
}

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface AssignedUser {
  id: string;
  role: string;
  created_at: string;
  profiles: {
    id: string;
    name: string;
    role: 'ADMIN' | 'MANAGER' | 'VOLUNTEER';
  };
}

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [assignments, setAssignments] = useState<AssignedUser[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { profile, user } = useAuth();
  const { toast } = useToast();

  const isCurrentUserAssigned = assignments.some(a => a.profiles.id === user?.id);

  useEffect(() => {
    if (id) {
      loadCompany();
      loadCompanyTags();
      loadCompanyAssignments();
    }
  }, [id]);

  const loadCompany = async (updateLoadingState = true) => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setCompany(data);
    } catch (error) {
      console.error('Error loading company:', error);
      toast({
        title: "Erreur",
        description: "Échec du chargement des détails de l'entreprise",
        variant: "destructive",
      });
    } finally {
      if (updateLoadingState) {
        setIsLoading(false);
      }
    }
  };

  const loadCompanyTags = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('company_tags')
        .select(`
          tags:tag_id (
            id,
            name,
            color
          )
        `)
        .eq('company_id', id);

      if (error) throw error;
      setTags(data?.map((ct: any) => ct.tags).filter(Boolean) || []);
    } catch (error) {
      console.error('Error loading company tags:', error);
    }
  };

  const loadCompanyAssignments = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select(`
          id,
          role,
          created_at,
          profiles:user_id (
            id,
            name,
            role
          )
        `)
        .eq('company_id', id);

      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      console.error('Error loading company assignments:', error);
    }
  };

  const handleUpdateCompany = async (formData: any, tagIds: string[]) => {
    if (!company) return;
    
    setIsLoading(true);
    try {
      // Update company
      const { error: updateError } = await supabase
        .from('companies')
        .update(formData)
        .eq('id', company.id);

      if (updateError) throw updateError;

      // Update tags
      // First, delete existing tags
      await supabase
        .from('company_tags')
        .delete()
        .eq('company_id', company.id);

      // Then, insert new tags
      if (tagIds.length > 0) {
        const tagInserts = tagIds.map(tagId => ({
          company_id: company.id,
          tag_id: tagId,
        }));
        
        await supabase
          .from('company_tags')
          .insert(tagInserts);
      }

    await loadCompany(false);
    await loadCompanyTags();
    await loadCompanyAssignments();
    
    toast({
      title: "Entreprise mise à jour",
      description: "L'entreprise a été mise à jour avec succès.",
    });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignSelf = async () => {
    if (!user || !company) return;

    try {
      const { error } = await supabase
        .from('assignments')
        .insert({
          company_id: company.id,
          user_id: user.id,
          role: 'CONTACT'
        });

      if (error) throw error;

      await loadCompanyAssignments();
      
      toast({
        title: "Assignation réussie",
        description: "Vous avez été assigné à cette entreprise.",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const canEdit = profile?.role === 'ADMIN' || profile?.role === 'MANAGER' || profile?.role === 'VOLUNTEER';

  if (isLoading) {
    return (
      <PageLayout title="Chargement..." showBackButton backTo="/?tab=companies">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </PageLayout>
    );
  }

  if (!company) {
    return (
      <PageLayout title="Erreur" showBackButton backTo="/?tab=companies">
        <div className="text-center py-12">
          <p className="text-lg text-foreground">Entreprise introuvable</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={company.name}
      showBackButton
      backTo="/?tab=companies"
      actions={
        canEdit && (
          <Button onClick={() => setIsEditDialogOpen(true)} size="sm">
            <Edit className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Modifier</span>
          </Button>
        )
      }
    >
      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Infos Card */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Informations de l'entreprise</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">Statut</span>
                <StatusBadge status={company.status} />
              </div>
              
              {company.contact_name && (
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-foreground">Contact :</span>
                  <span className="text-foreground">{company.contact_name}</span>
                </div>
              )}
              
              {company.contact_email && (
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{company.contact_email}</span>
                </div>
              )}
              
              {company.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{company.phone}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Créé {formatDistanceToNow(new Date(company.created_at), { addSuffix: true })}
                </span>
              </div>
            </CardContent>
          </Card>
          
          {/* Notes Section */}
          <NotesSection companyId={company.id} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tags Card */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Étiquettes</CardTitle>
            </CardHeader>
            <CardContent>
              {tags.length === 0 ? (
                <p className="text-muted-foreground text-sm">Aucune étiquette assignée</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-3 py-1 rounded-full text-sm font-medium text-white"
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Users Card */}
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <User className="h-5 w-5" />
                  <span>Assignés ({assignments.length})</span>
                </CardTitle>
                {!isCurrentUserAssigned && (
                  <Button size="sm" onClick={handleAssignSelf} className="text-xs md:text-sm">
                    <UserPlus className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    M'assigner
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {assignments.length === 0 ? (
                <p className="text-muted-foreground text-sm">Aucun utilisateur assigné</p>
              ) : (
                <div className="space-y-3">
                  {assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between p-3 border rounded-lg text-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <User className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {assignment.profiles.name}
                            {assignment.profiles.id === user?.id && (
                              <span className="ml-1 text-xs bg-primary/10 text-primary px-1 rounded">
                                Vous
                              </span>
                            )}
                          </p>
                          <div className="flex items-center gap-1 mt-1 flex-wrap">
                            <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                              {assignment.role}
                            </span>
                            <span className="text-xs border text-muted-foreground px-2 py-1 rounded">
                              {assignment.profiles.role}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                        {new Date(assignment.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog Modal */}
      {company && (
        <CompanyEditDialog
          company={company}
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onSubmit={handleUpdateCompany}
        />
      )}
    </PageLayout>
  );
}