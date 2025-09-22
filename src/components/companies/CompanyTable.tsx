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
import { Search, Plus, MoreHorizontal } from 'lucide-react';
import { Company } from '@/types/crm';
import { StatusBadge } from '@/components/ui/status-badge';
import { TagBadge } from '@/components/ui/tag-badge';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CompanyTableProps {
  companies: Company[];
}

export function CompanyTable({ companies }: CompanyTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.contactEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Companies</CardTitle>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Add Company
          </Button>
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
              {filteredCompanies.map((company) => (
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
                    {company.contactName && (
                      <div>
                        <div className="font-medium text-foreground">{company.contactName}</div>
                        {company.contactEmail && (
                          <div className="text-sm text-muted-foreground">{company.contactEmail}</div>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={company.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {company.tags.slice(0, 2).map((tag) => (
                        <TagBadge key={tag.id} tag={tag} />
                      ))}
                      {company.tags.length > 2 && (
                        <span className="text-xs text-muted-foreground">
                          +{company.tags.length - 2} more
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {company.boothNumber && (
                      <div className="text-sm">
                        <div className="font-medium text-foreground">{company.boothNumber}</div>
                        <div className="text-muted-foreground">{company.boothLocation}</div>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(company.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Add Note</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}