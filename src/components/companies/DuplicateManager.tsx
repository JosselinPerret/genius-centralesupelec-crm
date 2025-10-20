import { useState, useEffect } from 'react';
import { AlertCircle, Check, ChevronDown, ChevronUp, Merge2, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  DuplicateGroup,
  getAllCompaniesAndDetectDuplicates,
  mergeCompanies
} from '@/lib/duplicate-detection';
import { Company } from '@/types/crm';

export function DuplicateManager() {
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
  const [mergeDialog, setMergeDialog] = useState<{
    isOpen: boolean;
    masterCompanyId: string | null;
    duplicateCompanyId: string | null;
    groupIndex: number | null;
  }>({
    isOpen: false,
    masterCompanyId: null,
    duplicateCompanyId: null,
    groupIndex: null,
  });
  const [isMerging, setIsMerging] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadDuplicates();
  }, []);

  const loadDuplicates = async () => {
    setIsLoading(true);
    try {
      const duplicates = await getAllCompaniesAndDetectDuplicates();
      setDuplicateGroups(duplicates);
      
      if (duplicates.length === 0) {
        toast({
          title: 'Analyse complète',
          description: 'Aucun doublon détecté. Vos données sont propres !',
        });
      } else {
        toast({
          title: `${duplicates.length} groupe(s) de doublons trouvé(s)`,
          description: 'Vérifiez les potentiels doublons ci-dessous.',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpandGroup = (index: number) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedGroups(newExpanded);
  };

  const handleMergeClick = (groupIndex: number, masterCompany: Company, duplicateCompany: Company) => {
    setMergeDialog({
      isOpen: true,
      masterCompanyId: masterCompany.id,
      duplicateCompanyId: duplicateCompany.id,
      groupIndex,
    });
  };

  const handleConfirmMerge = async () => {
    if (!mergeDialog.masterCompanyId || !mergeDialog.duplicateCompanyId) return;

    setIsMerging(true);
    try {
      const result = await mergeCompanies(
        mergeDialog.masterCompanyId,
        mergeDialog.duplicateCompanyId
      );

      if (result.success) {
        toast({
          title: 'Fusion réussie',
          description: result.message,
        });
        
        // Reload duplicates
        setMergeDialog({
          isOpen: false,
          masterCompanyId: null,
          duplicateCompanyId: null,
          groupIndex: null,
        });
        await loadDuplicates();
      } else {
        toast({
          title: 'Erreur',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsMerging(false);
    }
  };

  const filteredGroups = duplicateGroups.filter(group =>
    group.potential.some(company =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-6">
      <Card className="shadow-card border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-950">
        <CardHeader>
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mt-1 flex-shrink-0" />
            <div>
              <CardTitle className="text-yellow-900 dark:text-yellow-100">Détection de doublons</CardTitle>
              <CardDescription className="text-yellow-800 dark:text-yellow-200">
                Analysez et fusionnez les entreprises en doublon. Cet outil détecte les doublons basés sur 
                la similarité des noms, emails, numéros de téléphone et noms de contacts.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Analyse des doublons</CardTitle>
            <Button 
              onClick={loadDuplicates} 
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? (
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mr-2" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Analyser
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {duplicateGroups.length > 0 && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un doublon..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <p className="text-sm text-muted-foreground">
                {filteredGroups.length} groupe(s) de doublons
              </p>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {duplicateGroups.length === 0
                  ? 'Aucun doublon détecté. Cliquez sur "Analyser" pour commencer.'
                  : 'Aucun doublon ne correspond à votre recherche.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredGroups.map((group, groupIndex) => (
                <div 
                  key={groupIndex} 
                  className="border rounded-lg p-4 bg-card hover:bg-muted/50 transition-colors"
                >
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleExpandGroup(groupIndex)}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Merge2 className="h-5 w-5 text-amber-500" />
                      <div className="flex-1">
                        <div className="font-semibold">
                          {group.potential[0].name}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {group.reason}
                        </p>
                      </div>
                      <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">
                        {group.potential.length} résultat{group.potential.length !== 1 ? 's' : ''}
                      </div>
                      <div 
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${group.similarity > 0.9 ? 'bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-100 border-red-200 dark:border-red-800' : 'bg-yellow-50 dark:bg-yellow-950 text-yellow-900 dark:text-yellow-100 border-yellow-200 dark:border-yellow-800'}`}
                      >
                        {(group.similarity * 100).toFixed(0)}% similaire
                      </div>
                    </div>
                    {expandedGroups.has(groupIndex) ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>

                  {expandedGroups.has(groupIndex) && (
                    <div className="mt-4 space-y-3 pt-4 border-t">
                      {group.potential.map((company, companyIndex) => (
                        <div 
                          key={company.id}
                          className="p-3 bg-muted/50 rounded-md space-y-2"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium">{company.name}</div>
                              {company.contact_name && (
                                <p className="text-sm text-muted-foreground">
                                  Contact: {company.contact_name}
                                </p>
                              )}
                              {company.contact_email && (
                                <p className="text-sm text-muted-foreground">
                                  {company.contact_email}
                                </p>
                              )}
                              {company.phone && (
                                <p className="text-sm text-muted-foreground">
                                  {company.phone}
                                </p>
                              )}
                            </div>
                          </div>

                          {companyIndex > 0 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleMergeClick(
                                  groupIndex,
                                  group.potential[0],
                                  company
                                )
                              }
                              className="w-full"
                            >
                              <Merge2 className="h-4 w-4 mr-2" />
                              Fusionner avec le premier
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <MergeConfirmDialog
        isOpen={mergeDialog.isOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setMergeDialog({
              isOpen: false,
              masterCompanyId: null,
              duplicateCompanyId: null,
              groupIndex: null,
            });
          }
        }}
        masterCompanyId={mergeDialog.masterCompanyId}
        duplicateCompanyId={mergeDialog.duplicateCompanyId}
        onConfirm={handleConfirmMerge}
        isMerging={isMerging}
      />
    </div>
  );
}

interface MergeConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  masterCompanyId: string | null;
  duplicateCompanyId: string | null;
  onConfirm: () => void;
  isMerging: boolean;
}

function MergeConfirmDialog({
  isOpen,
  onOpenChange,
  masterCompanyId,
  duplicateCompanyId,
  onConfirm,
  isMerging,
}: MergeConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmer la fusion</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir fusionner ces entreprises ? 
            Cette action ne peut pas être annulée.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 my-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-md border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
              Lors de la fusion :
            </p>
            <ul className="text-sm text-blue-900 dark:text-blue-100 space-y-1 list-disc list-inside">
              <li>L'entreprise principale conserve toutes ses informations</li>
              <li>Les informations manquantes seront complétées par le doublon</li>
              <li>Les étiquettes et assignations seront fusionnées</li>
              <li>Les notes seront combinées</li>
              <li>L'entreprise en doublon sera supprimée</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isMerging}
          >
            Annuler
          </Button>
          <Button 
            variant="destructive"
            onClick={onConfirm}
            disabled={isMerging}
          >
            {isMerging ? (
              <div className="animate-spin h-4 w-4 border-2 border-background border-t-transparent rounded-full mr-2" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            Fusionner
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
