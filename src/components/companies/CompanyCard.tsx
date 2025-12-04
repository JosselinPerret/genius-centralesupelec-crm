import { Company } from '@/types/crm';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Edit, Trash2, User, Mail, Phone, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

interface CompanyCardProps {
  company: CompanyWithTags;
  canDelete: boolean;
  onDelete: (id: string) => void;
}

export function CompanyCard({ company, canDelete, onDelete }: CompanyCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="shadow-card hover:shadow-elevated transition-shadow">
      <CardContent className="p-4">
        {/* Header with company name and actions */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground truncate">{company.name}</h3>
            {company.phone && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <Phone className="h-3 w-3" />
                <span className="truncate">{company.phone}</span>
              </div>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 shrink-0">
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
              {canDelete && (
                <DropdownMenuItem 
                  className="text-destructive" 
                  onClick={() => onDelete(company.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Contact info */}
        {company.contact_name && (
          <div className="mb-3 p-2 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-1 text-sm font-medium text-foreground">
              <User className="h-3 w-3 text-muted-foreground" />
              <span className="truncate">{company.contact_name}</span>
            </div>
            {company.contact_email && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Mail className="h-3 w-3" />
                <span className="truncate">{company.contact_email}</span>
              </div>
            )}
          </div>
        )}

        {/* Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <StatusBadge status={company.status} />
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {new Date(company.updated_at).toLocaleDateString('fr-FR')}
          </div>
        </div>

        {/* Tags */}
        {company.tags && company.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {company.tags.slice(0, 3).map(tag => (
              <Badge 
                key={tag.id} 
                style={{ backgroundColor: tag.color, color: 'white' }}
                className="text-xs"
              >
                {tag.name}
              </Badge>
            ))}
            {company.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{company.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Assignments */}
        <div className="flex items-center gap-2">
          {company.assignedUsers && company.assignedUsers > 0 ? (
            <Badge variant="secondary" className="text-xs">
              {company.assignedUsers} utilisateur{company.assignedUsers !== 1 ? 's' : ''}
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">Aucune assignation</span>
          )}
          {company.hasCurrentUserAssignment && (
            <Badge variant="outline" className="text-xs text-primary border-primary">
              Vous
            </Badge>
          )}
        </div>

        {/* Quick action button */}
        <Button 
          className="w-full mt-3" 
          variant="outline" 
          size="sm"
          onClick={() => navigate(`/company/${company.id}`)}
        >
          <Eye className="mr-2 h-4 w-4" />
          Voir les détails
        </Button>
      </CardContent>
    </Card>
  );
}
