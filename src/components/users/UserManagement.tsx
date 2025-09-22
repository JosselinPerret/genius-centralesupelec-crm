import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Shield, UserCheck } from 'lucide-react';
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
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      loadProfiles();
      
      toast({
        title: "Role updated",
        description: "User role has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
          <CardTitle>User Management</CardTitle>
          {!canManageRoles && (
            <p className="text-sm text-muted-foreground">
              Only administrators can modify user roles.
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {profiles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No users found.
              </div>
            ) : (
              profiles.map((userProfile) => {
                const RoleIcon = roleIcons[userProfile.role];
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
                          Joined {formatDistanceToNow(new Date(userProfile.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary">
                        {userProfile.role}
                      </Badge>
                      
                      {canManageRoles && userProfile.user_id !== profile?.user_id && (
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
                      )}
                      
                      {userProfile.user_id === profile?.user_id && (
                        <Badge variant="outline">You</Badge>
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