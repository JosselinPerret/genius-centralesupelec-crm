import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { Users, Shield, UserCheck, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Profile {
  id: string;
  user_id: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'VOLUNTEER';
  created_at: string;
  updated_at: string;
}

const roleIcons = {
  ADMIN: Shield,
  MANAGER: UserCheck,
  VOLUNTEER: Users,
};

const roleColors = {
  ADMIN: 'bg-destructive',
  MANAGER: 'bg-primary',
  VOLUNTEER: 'bg-secondary',
};

export function UserManagement() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const { profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error loading profiles:', error);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'ADMIN' | 'MANAGER' | 'VOLUNTEER') => {
    setIsLoading(true);
    try {
      // Update in user_roles table (uses user_role_new enum)
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId)
        .select();

      if (rolesError) {
        console.error('Error updating user_roles:', rolesError);
        throw rolesError;
      }
      
      if (!rolesData || rolesData.length === 0) {
        throw new Error('Aucune ligne mise à jour dans user_roles');
      }

      // Also update in profiles table for consistency (uses user_role enum)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('user_id', userId)
        .select();

      if (profileError) {
        console.error('Error updating profiles:', profileError);
        throw profileError;
      }
      
      if (!profileData || profileData.length === 0) {
        throw new Error('Aucune ligne mise à jour dans profiles');
      }

      await loadProfiles();
      
      toast({
        title: "Rôle mis à jour",
        description: "Le rôle de l'utilisateur a été mis à jour avec succès.",
      });
    } catch (error: any) {
      console.error('Error in updateUserRole:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la mise à jour du rôle",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    setDeletingUserId(userId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `https://gzapjsbpymfmliurdqen.supabase.co/functions/v1/delete-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ userId }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la suppression');
      }

      await loadProfiles();
      
      toast({
        title: "Utilisateur supprimé",
        description: "L'utilisateur a été supprimé avec succès.",
      });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la suppression",
        variant: "destructive",
      });
    } finally {
      setDeletingUserId(null);
    }
  };

  const canManageRoles = profile?.role === 'ADMIN';

  const getUserStats = () => {
    const adminCount = profiles.filter(p => p.role === 'ADMIN').length;
    const managerCount = profiles.filter(p => p.role === 'MANAGER').length;
    const volunteerCount = profiles.filter(p => p.role === 'VOLUNTEER').length;
    
    return { adminCount, managerCount, volunteerCount };
  };

  const stats = getUserStats();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-card">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Admins</p>
              <p className="text-2xl font-bold text-foreground">{stats.adminCount}</p>
            </div>
            <Shield className="h-8 w-8 text-destructive" />
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Managers</p>
              <p className="text-2xl font-bold text-foreground">{stats.managerCount}</p>
            </div>
            <UserCheck className="h-8 w-8 text-primary" />
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Volunteers</p>
              <p className="text-2xl font-bold text-foreground">{stats.volunteerCount}</p>
            </div>
            <Users className="h-8 w-8 text-secondary-foreground" />
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Gestion des utilisateurs</CardTitle>
          {!canManageRoles && (
            <p className="text-sm text-muted-foreground">
              Seuls les administrateurs peuvent modifier les rôles et supprimer des utilisateurs.
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {profiles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucun utilisateur trouvé.
              </div>
            ) : (
              profiles.map((userProfile) => {
                const RoleIcon = roleIcons[userProfile.role];
                const isCurrentUser = userProfile.user_id === profile?.user_id;
                return (
                  <div
                    key={userProfile.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${roleColors[userProfile.role]}`}>
                        <RoleIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{userProfile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Inscrit {formatDistanceToNow(new Date(userProfile.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary">
                        {userProfile.role}
                      </Badge>
                      
                      {canManageRoles && !isCurrentUser && (
                        <>
                          <Select
                            value={userProfile.role}
                            onValueChange={(newRole: any) => updateUserRole(userProfile.user_id, newRole)}
                            disabled={isLoading}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="VOLUNTEER">Volunteer</SelectItem>
                              <SelectItem value="MANAGER">Manager</SelectItem>
                              <SelectItem value="ADMIN">Admin</SelectItem>
                            </SelectContent>
                          </Select>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="icon"
                                disabled={deletingUserId === userProfile.user_id}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer cet utilisateur ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Êtes-vous sûr de vouloir supprimer <strong>{userProfile.name}</strong> ? 
                                  Cette action est irréversible et supprimera toutes les données associées à cet utilisateur.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteUser(userProfile.user_id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                      
                      {isCurrentUser && (
                        <Badge variant="outline">Vous</Badge>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
