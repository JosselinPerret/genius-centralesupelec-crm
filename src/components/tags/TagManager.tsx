import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit3, Trash2, Save, X, Palette } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Tag {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

const defaultColors = [
  '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', 
  '#EF4444', '#06B6D4', '#84CC16', '#F97316',
  '#EC4899', '#6B7280', '#14B8A6', '#F472B6'
];

export function TagManager() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(defaultColors[0]);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name');

      if (error) throw error;
      setTags(data || []);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const createTag = async () => {
    if (!newTagName.trim()) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('tags')
        .insert({
          name: newTagName.trim(),
          color: newTagColor,
        });

      if (error) throw error;

      setNewTagName('');
      setNewTagColor(defaultColors[0]);
      setIsAdding(false);
      loadTags();
      
      toast({
        title: "Tag created",
        description: "The tag has been created successfully.",
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

  const updateTag = async (tagId: string) => {
    if (!editName.trim()) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('tags')
        .update({ 
          name: editName.trim(),
          color: editColor
        })
        .eq('id', tagId);

      if (error) throw error;

      setEditingTag(null);
      setEditName('');
      setEditColor('');
      loadTags();
      
      toast({
        title: "Tag updated",
        description: "The tag has been updated successfully.",
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

  const deleteTag = async (tagId: string) => {
    if (!confirm('Are you sure you want to delete this tag? It will be removed from all companies.')) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', tagId);

      if (error) throw error;

      loadTags();
      
      toast({
        title: "Tag deleted",
        description: "The tag has been deleted successfully.",
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

  const startEditing = (tag: Tag) => {
    setEditingTag(tag.id);
    setEditName(tag.name);
    setEditColor(tag.color);
  };

  const cancelEditing = () => {
    setEditingTag(null);
    setEditName('');
    setEditColor('');
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Tag Management</CardTitle>
          <Button
            onClick={() => setIsAdding(true)}
            size="sm"
            disabled={isAdding}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Tag
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAdding && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <div className="space-y-2">
              <Label htmlFor="tag-name">Tag Name</Label>
              <Input
                id="tag-name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Enter tag name"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {defaultColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${
                      newTagColor === color ? 'border-foreground' : 'border-border'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewTagColor(color)}
                  />
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Preview</Label>
              <Badge style={{ backgroundColor: newTagColor, color: 'white' }}>
                {newTagName || 'Tag Name'}
              </Badge>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAdding(false);
                  setNewTagName('');
                  setNewTagColor(defaultColors[0]);
                }}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={createTag}
                disabled={isLoading || !newTagName.trim()}
              >
                <Save className="mr-2 h-4 w-4" />
                Create Tag
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {tags.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tags created yet. Add your first tag to get started.
            </div>
          ) : (
            tags.map((tag) => (
              <div key={tag.id} className="flex items-center justify-between p-3 border rounded-lg">
                {editingTag === tag.id ? (
                  <div className="flex-1 space-y-3">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Tag name"
                    />
                    
                    <div className="flex flex-wrap gap-2">
                      {defaultColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`w-6 h-6 rounded-full border ${
                            editColor === color ? 'border-foreground border-2' : 'border-border'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setEditColor(color)}
                        />
                      ))}
                    </div>
                    
                    <Badge style={{ backgroundColor: editColor, color: 'white' }}>
                      {editName || 'Tag Name'}
                    </Badge>
                    
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={cancelEditing}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => updateTag(tag.id)}
                        disabled={isLoading || !editName.trim()}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center space-x-3">
                      <Badge style={{ backgroundColor: tag.color, color: 'white' }}>
                        {tag.name}
                      </Badge>
                    </div>
                    
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditing(tag)}
                        disabled={editingTag !== null}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTag(tag.id)}
                        disabled={isLoading}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}