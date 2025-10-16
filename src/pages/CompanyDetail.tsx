import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, MapPin, Phone, Mail, Calendar, User, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { StatusBadge } from '@/components/ui/status-badge';
import { NotesSection } from '@/components/notes/NotesSection';
import { CompanyForm } from '@/components/companies/CompanyForm';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { MainLayout } from '@/components/layout/MainLayout';
import { formatDistanceToNow } from 'date-fns';

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
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [assignments, setAssignments] = useState<AssignedUser[]>([]);
  const [isEditing, setIsEditing] = useState(false);
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
      navigate('/?tab=companies');
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
    setIsEditing(false);
    
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
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </MainLayout>
    );
  }

  if (!company) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-lg text-foreground">Entreprise introuvable</p>
          <Button onClick={() => navigate('/?tab=companies')} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux entreprises
          </Button>
        </div>
      </MainLayout>
    );
  }

  if (isEditing) {
    return (
      <MainLayout>
        <div className="p-4 md:p-6 space-y-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => setIsEditing(false)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Annuler
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Modifier l'entreprise</h1>
          </div>
          
          <CompanyForm
            company={company}
            onSubmit={handleUpdateCompany}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between gap-2 md:gap-4">
        <div className="flex items-center space-x-2 md:space-x-4 min-w-0">
          <Button
            variant="ghost"
            onClick={() => navigate('/?tab=companies')}
            className="shrink-0"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="hidden md:inline">Retour</span>
          </Button>
          <h1 className="text-xl md:text-3xl font-bold text-foreground truncate">{company.name}</h1>
        </div>
        
        {canEdit && (
          <Button onClick={() => setIsEditing(true)} size="sm" className="shrink-0">
            <Edit className="mr-2 h-4 w-4" />
            <span className="hidden md:inline">Modifier</span>
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
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
          
          <NotesSection companyId={company.id} />
        </div>

        <div className="space-y-6">
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
                    <Badge
                      key={tag.id}
                      style={{ backgroundColor: tag.color, color: 'white' }}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Utilisateurs assignés ({assignments.length})
                </CardTitle>
                {!isCurrentUserAssigned && (
                  <Button size="sm" onClick={handleAssignSelf}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    M'assigner
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {assignments.length === 0 ? (
                <p className="text-muted-foreground text-sm">Aucun utilisateur assigné à cette entreprise</p>
              ) : (
                <div className="space-y-3">
                  {assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <User className="h-6 w-6 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground">
                            {assignment.profiles.name}
                            {assignment.profiles.id === user?.id && (
                              <Badge variant="outline" className="ml-2 text-primary border-primary">
                                Vous
                              </Badge>
                            )}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">
                              {assignment.role}
                            </Badge>
                            <Badge variant="outline">
                              {assignment.profiles.role}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Assigné le {new Date(assignment.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </MainLayout>
  );
}