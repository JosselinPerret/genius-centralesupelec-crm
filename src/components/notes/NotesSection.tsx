import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit3, Trash2, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Note {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  author_id: string;
  profiles: {
    name: string;
    role: string;
  };
}

interface NotesSectionProps {
  companyId: string;
}

export function NotesSection({ companyId }: NotesSectionProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadNotes();
  }, [companyId]);

  const loadNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select(`
          *,
          profiles:author_id (
            name,
            role
          )
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const addNote = async () => {
    if (!newNoteContent.trim() || !user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('notes')
        .insert({
          content: newNoteContent.trim(),
          company_id: companyId,
          author_id: user.id,
        });

      if (error) throw error;

      setNewNoteContent('');
      setIsAddingNote(false);
      loadNotes();
      
      toast({
        title: "Note added",
        description: "Your note has been added successfully.",
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

  const updateNote = async (noteId: string) => {
    if (!editContent.trim()) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('notes')
        .update({ content: editContent.trim() })
        .eq('id', noteId);

      if (error) throw error;

      setEditingNote(null);
      setEditContent('');
      loadNotes();
      
      toast({
        title: "Note updated",
        description: "Your note has been updated successfully.",
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

  const deleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      loadNotes();
      
      toast({
        title: "Note deleted",
        description: "The note has been deleted successfully.",
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

  const startEditing = (note: Note) => {
    setEditingNote(note.id);
    setEditContent(note.content);
  };

  const cancelEditing = () => {
    setEditingNote(null);
    setEditContent('');
  };

  const canEdit = (note: Note) => {
    return user?.id === note.author_id || profile?.role === 'ADMIN';
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Notes</CardTitle>
          {user && (
            <Button
              onClick={() => setIsAddingNote(true)}
              size="sm"
              disabled={isAddingNote}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Note
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAddingNote && (
          <div className="space-y-2 p-4 border rounded-lg bg-muted/50">
            <Textarea
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Enter your note..."
              rows={3}
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAddingNote(false);
                  setNewNoteContent('');
                }}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={addNote}
                disabled={isLoading || !newNoteContent.trim()}
              >
                <Save className="mr-2 h-4 w-4" />
                Save Note
              </Button>
            </div>
          </div>
        )}

        {notes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No notes available. Add the first note to get started.
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">{note.profiles.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {note.profiles.role}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  {canEdit(note) && (
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditing(note)}
                        disabled={editingNote !== null}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNote(note.id)}
                        disabled={isLoading}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                
                {editingNote === note.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={3}
                    />
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
                        onClick={() => updateNote(note.id)}
                        disabled={isLoading || !editContent.trim()}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {note.content}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}