import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface CompanyFormData {
  name: string;
  contact_name?: string;
  contact_email?: string;
  phone?: string;
  status: 'PROSPECT' | 'ACTIVE' | 'INACTIVE' | 'FORMER';
}

interface CompanyFormProps {
  company?: any;
  onSubmit: (data: CompanyFormData, tagIds: string[]) => void;
  onCancel: () => void;
}

export function CompanyForm({ company, onSubmit, onCancel }: CompanyFormProps) {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CompanyFormData>({
    defaultValues: company || {
      status: 'PROSPECT',
    }
  });

  const statusValue = watch('status');

  useEffect(() => {
    loadTags();
    if (company) {
      loadCompanyTags();
    }
  }, [company]);

  const loadTags = async () => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name');

      if (error) throw error;
      setAvailableTags(data || []);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const loadCompanyTags = async () => {
    if (!company?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('company_tags')
        .select('tag_id')
        .eq('company_id', company.id);

      if (error) throw error;
      setSelectedTags(data?.map(ct => ct.tag_id) || []);
    } catch (error) {
      console.error('Error loading company tags:', error);
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleFormSubmit = async (data: CompanyFormData) => {
    setIsLoading(true);
    try {
      await onSubmit(data, selectedTags);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>{company ? 'Modifier l\'entreprise' : 'Ajouter une nouvelle entreprise'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de l'entreprise *</Label>
              <Input
                id="name"
                {...register('name', { required: 'Le nom de l\'entreprise est requis' })}
                placeholder="Entrez le nom de l'entreprise"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select value={statusValue} onValueChange={(value) => setValue('status', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PROSPECT">Prospect</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="FORMER">Former</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_name">Nom du contact</Label>
              <Input
                id="contact_name"
                {...register('contact_name')}
                placeholder="Entrez le nom du contact"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_email">Email du contact</Label>
              <Input
                id="contact_email"
                type="email"
                {...register('contact_email')}
                placeholder="Entrez l'email du contact"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="Entrez le numéro de téléphone"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Étiquettes</Label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag.id);
                return (
                  <Badge
                    key={tag.id}
                    variant={isSelected ? "default" : "secondary"}
                    className="cursor-pointer"
                    style={isSelected ? { backgroundColor: tag.color } : {}}
                    onClick={() => toggleTag(tag.id)}
                  >
                    {tag.name}
                    {isSelected && <X className="ml-1 h-3 w-3" />}
                  </Badge>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Enregistrement...' : company ? 'Mettre à jour' : 'Créer l\'entreprise'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}