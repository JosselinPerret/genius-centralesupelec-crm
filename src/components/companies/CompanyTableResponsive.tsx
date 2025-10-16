import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Eye, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface Company {
  id: string;
  name: string;
  contact_name?: string;
  contact_email?: string;
  phone?: string;
  status: string;
  updated_at: string;
  tags?: Tag[];
  assignedUsers?: number;
  hasCurrentUserAssignment?: boolean;
}

interface CompanyTableResponsiveProps {
  companies: Company[];
  isLoading: boolean;
  onDelete?: (id: string) => void;
  canDelete?: boolean;
}

export function CompanyTableResponsive({
  companies,
  isLoading,
  onDelete,
  canDelete = false
}: CompanyTableResponsiveProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Aucune entreprise trouvée
      </div>
    );
  }

  // Mobile view - Cards
  const mobileView = (
    <div className="space-y-3">
      {companies.map((company) => (
        <Card key={company.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex justify-between items-start gap-2 mb-3">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-foreground truncate text-sm md:text-base">
                  {company.name}
                </h3>
                {company.contact_name && (
                  <p className="text-xs md:text-sm text-muted-foreground truncate">
                    {company.contact_name}
                  </p>
                )}
              </div>
              <StatusBadge status={company.status} />
            </div>

            {company.contact_email && (
              <p className="text-xs text-muted-foreground truncate mb-2">
                {company.contact_email}
              </p>
            )}

            {company.phone && (
              <p className="text-xs text-muted-foreground mb-3">
                {company.phone}
              </p>
            )}

            <div className="flex flex-wrap gap-1 mb-3">
              {company.tags?.slice(0, 2).map((tag) => (
                <Badge
                  key={tag.id}
                  style={{
                    backgroundColor: tag.color,
                    color: 'white'
                  }}
                  className="text-xs"
                >
                  {tag.name}
                </Badge>
              ))}
              {(company.tags?.length || 0) > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{(company.tags?.length || 0) - 2}
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between mb-3 border-t border-border pt-3">
              <div className="flex items-center gap-1">
                {company.assignedUsers! > 0 ? (
                  <Badge variant="secondary" className="text-xs">
                    {company.assignedUsers} user{company.assignedUsers !== 1 ? 's' : ''}
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">Pas d'assignations</span>
                )}
                {company.hasCurrentUserAssignment && (
                  <Badge variant="outline" className="text-primary border-primary text-xs">
                    Vous
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(company.updated_at).toLocaleDateString('fr-FR')}
              </span>
            </div>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => navigate(`/company/${company.id}`)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Voir
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem
                    onClick={() => navigate(`/company/${company.id}`)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </DropdownMenuItem>
                  {canDelete && (
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => onDelete?.(company.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Supprimer
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Desktop view - Table
  const desktopView = (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[150px]">Entreprise</TableHead>
            <TableHead className="min-w-[150px]">Contact</TableHead>
            <TableHead className="min-w-[120px]">Statut</TableHead>
            <TableHead className="min-w-[200px]">Étiquettes</TableHead>
            <TableHead className="min-w-[120px]">Assignations</TableHead>
            <TableHead className="min-w-[100px]">Modifié</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => (
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
                    <div className="font-medium text-foreground">
                      {company.contact_name}
                    </div>
                    {company.contact_email && (
                      <div className="text-sm text-muted-foreground">
                        {company.contact_email}
                      </div>
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
                    <Badge
                      key={tag.id}
                      style={{
                        backgroundColor: tag.color,
                        color: 'white'
                      }}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                  {(company.tags?.length || 0) > 2 && (
                    <span className="text-xs text-muted-foreground">
                      +{(company.tags?.length || 0) - 2}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {company.assignedUsers! > 0 ? (
                    <Badge variant="secondary">
                      {company.assignedUsers} user{company.assignedUsers !== 1 ? 's' : ''}
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">Pas d'assignations</span>
                  )}
                  {company.hasCurrentUserAssignment && (
                    <Badge variant="outline" className="text-primary border-primary">
                      Vous
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(company.updated_at).toLocaleDateString('fr-FR')}
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
                    {canDelete && (
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => onDelete?.(company.id)}
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
  );

  return (
    <>
      {/* Mobile view */}
      <div className="md:hidden">{mobileView}</div>

      {/* Desktop view */}
      <div className="hidden md:block">{desktopView}</div>
    </>
  );
}
