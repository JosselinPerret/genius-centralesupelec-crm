import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export function CsvImport({ onImportComplete }: { onImportComplete: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const { toast } = useToast();
  const { user, profile } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    // Parse header
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    // Parse rows
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length === headers.length) {
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });
        rows.push(row);
      }
    }
    
    return rows;
  };

  const findOrCreateTag = async (tagName: string): Promise<string | null> => {
    if (!tagName || tagName.trim() === '') return null;

    // Check if tag exists
    const { data: existingTags } = await supabase
      .from('tags')
      .select('id')
      .ilike('name', tagName.trim());

    if (existingTags && existingTags.length > 0) {
      return existingTags[0].id;
    }

    // Create new tag
    const { data: newTag, error } = await supabase
      .from('tags')
      .insert({ name: tagName.trim() })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating tag:', error);
      return null;
    }

    return newTag.id;
  };

  const handleImport = async () => {
    if (!file || !user) return;

    setImporting(true);
    const importResult: ImportResult = {
      success: 0,
      failed: 0,
      errors: []
    };

    try {
      const text = await file.text();
      const rows = parseCSV(text);

      for (const row of rows) {
        try {
          const companyName = row['Nom entreprise'];
          const description = row['Description'] || '';
          const secteur = row['Secteur'] || '';
          const typeEntreprise = row['Type entreprise'] || '';
          const mail = row['Mail'] || '';
          const commentaires = row['Commentaires'] || '';

          if (!companyName) {
            importResult.failed++;
            importResult.errors.push('Missing company name');
            continue;
          }

          // Create company
          const { data: company, error: companyError } = await supabase
            .from('companies')
            .insert({
              name: companyName,
              contact_email: mail,
              status: 'TO_CONTACT'
            })
            .select()
            .single();

          if (companyError || !company) {
            importResult.failed++;
            importResult.errors.push(`Failed to create company "${companyName}": ${companyError?.message}`);
            continue;
          }

          // Create tag if provided
          if (typeEntreprise) {
            const tagId = await findOrCreateTag(typeEntreprise);
            if (tagId) {
              await supabase
                .from('company_tags')
                .insert({
                  company_id: company.id,
                  tag_id: tagId
                });
            }
          }

          // Create note with description and comments
          const noteContent = [description, commentaires]
            .filter(text => text && text.trim())
            .join('\n\n');

          if (noteContent) {
            await supabase
              .from('notes')
              .insert({
                company_id: company.id,
                author_id: user.id,
                content: noteContent
              });
          }

          importResult.success++;
        } catch (error: any) {
          importResult.failed++;
          importResult.errors.push(error.message);
        }
      }

      setResult(importResult);
      
      toast({
        title: 'Import complete',
        description: `Successfully imported ${importResult.success} companies. ${importResult.failed} failed.`,
        variant: importResult.failed > 0 ? 'destructive' : 'default'
      });

      if (importResult.success > 0) {
        onImportComplete();
      }
    } catch (error: any) {
      toast({
        title: 'Import failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setImporting(false);
    }
  };

  // Only show to admins
  if (profile?.role !== 'ADMIN') {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Import Companies from CSV
        </CardTitle>
        <CardDescription>
          Upload a CSV file with columns: Nom entreprise, Description, Secteur, Type entreprise, Mail, Commentaires
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
          </div>
          <Button
            onClick={handleImport}
            disabled={!file || importing}
          >
            {importing ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                Importing...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Import
              </>
            )}
          </Button>
        </div>

        {result && (
          <div className="space-y-2 p-4 bg-muted rounded-md">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Successfully imported: {result.success}</span>
            </div>
            {result.failed > 0 && (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span>Failed: {result.failed}</span>
                </div>
                {result.errors.length > 0 && (
                  <div className="mt-2 text-xs text-muted-foreground max-h-32 overflow-y-auto">
                    <div className="font-semibold mb-1">Errors:</div>
                    {result.errors.slice(0, 5).map((error, i) => (
                      <div key={i}>• {error}</div>
                    ))}
                    {result.errors.length > 5 && (
                      <div>... and {result.errors.length - 5} more</div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
