import { Company } from '@/types/crm';
import { supabase } from '@/integrations/supabase/client';

export interface DuplicateGroup {
  potential: Company[];
  similarity: number; // 0-1, higher means more similar
  reason: string;
}

/**
 * Calculates similarity between two strings (Levenshtein distance normalized)
 */
function calculateStringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;
  
  const maxLen = Math.max(s1.length, s2.length);
  const distance = levenshteinDistance(s1, s2);
  return 1 - (distance / maxLen);
}

/**
 * Levenshtein distance algorithm
 */
function levenshteinDistance(s1: string, s2: string): number {
  const len1 = s1.length;
  const len2 = s2.length;
  const d: number[][] = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));
  
  for (let i = 0; i <= len1; i++) d[i][0] = i;
  for (let j = 0; j <= len2; j++) d[0][j] = j;
  
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,      // deletion
        d[i][j - 1] + 1,      // insertion
        d[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  return d[len1][len2];
}

/**
 * Detects potential duplicate companies
 */
export async function detectDuplicates(companies: Company[]): Promise<DuplicateGroup[]> {
  if (companies.length < 2) return [];
  
  const duplicates: DuplicateGroup[] = [];
  const processed = new Set<string>();
  
  for (let i = 0; i < companies.length; i++) {
    const company1 = companies[i];
    if (processed.has(company1.id)) continue;
    
    const potentialMatches = [];
    const reasons = [];
    
    for (let j = i + 1; j < companies.length; j++) {
      const company2 = companies[j];
      if (processed.has(company2.id)) continue;
      
      let similarity = 0;
      let reason = '';
      
      // Check name similarity (highest priority)
      const nameSimilarity = calculateStringSimilarity(company1.name, company2.name);
      if (nameSimilarity > 0.85) {
        similarity = Math.max(similarity, nameSimilarity);
        reason = `Noms très similaires (${(nameSimilarity * 100).toFixed(0)}%)`;
      }
      
      // Check email similarity
      if (company1.contact_email && company2.contact_email) {
        if (company1.contact_email === company2.contact_email) {
          similarity = 0.95;
          reason = 'Email de contact identique';
        }
      }
      
      // Check phone similarity
      if (company1.phone && company2.phone) {
        const phoneSimilarity = calculateStringSimilarity(
          company1.phone.replace(/\D/g, ''),
          company2.phone.replace(/\D/g, '')
        );
        if (phoneSimilarity > 0.9) {
          similarity = Math.max(similarity, phoneSimilarity);
          reason = `Numéros de téléphone similaires (${(phoneSimilarity * 100).toFixed(0)}%)`;
        }
      }
      
      // Check contact name similarity
      if (company1.contact_name && company2.contact_name) {
        const contactSimilarity = calculateStringSimilarity(
          company1.contact_name,
          company2.contact_name
        );
        if (contactSimilarity > 0.85 && nameSimilarity > 0.7) {
          similarity = Math.max(similarity, (contactSimilarity + nameSimilarity) / 2);
          reason = 'Noms d\'entreprise et de contact similaires';
        }
      }
      
      // Check for exact duplicates (name + email + phone)
      if (
        company1.name.toLowerCase() === company2.name.toLowerCase() &&
        ((!company1.contact_email && !company2.contact_email) ||
         company1.contact_email === company2.contact_email) &&
        ((!company1.phone && !company2.phone) ||
         company1.phone === company2.phone)
      ) {
        similarity = 1;
        reason = 'Doublon exact';
      }
      
      if (similarity > 0.7) {
        potentialMatches.push(company2);
        reasons.push(reason);
      }
    }
    
    if (potentialMatches.length > 0) {
      const avgSimilarity = potentialMatches.reduce((acc, comp2) => {
        const nameSim = calculateStringSimilarity(company1.name, comp2.name);
        return acc + nameSim;
      }, 0) / potentialMatches.length;
      
      duplicates.push({
        potential: [company1, ...potentialMatches],
        similarity: avgSimilarity,
        reason: reasons[0] || 'Doublons potentiels'
      });
      
      processed.add(company1.id);
      potentialMatches.forEach(comp => processed.add(comp.id));
    }
  }
  
  // Sort by similarity (highest first)
  return duplicates.sort((a, b) => b.similarity - a.similarity);
}

/**
 * Merges two companies, keeping the master and deleting the duplicate
 */
export async function mergeCompanies(
  masterCompanyId: string,
  duplicateCompanyId: string,
  mergeData?: Partial<Company>
): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Get both companies
    const { data: masterCompany, error: masterError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', masterCompanyId)
      .single();
    
    const { data: duplicateCompany, error: duplicateError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', duplicateCompanyId)
      .single();
    
    if (masterError || duplicateError || !masterCompany || !duplicateCompany) {
      throw new Error('Impossible de trouver une ou les deux entreprises');
    }
    
    // 2. Prepare merged data
    const merged = {
      name: mergeData?.name || masterCompany.name,
      contact_name: mergeData?.contact_name || masterCompany.contact_name || duplicateCompany.contact_name,
      contact_email: mergeData?.contact_email || masterCompany.contact_email || duplicateCompany.contact_email,
      phone: mergeData?.phone || masterCompany.phone || duplicateCompany.phone,
      status: mergeData?.status || masterCompany.status,
      booth_number: mergeData?.booth_number || masterCompany.booth_number || duplicateCompany.booth_number,
      booth_location: mergeData?.booth_location || masterCompany.booth_location || duplicateCompany.booth_location,
      booth_size: mergeData?.booth_size || masterCompany.booth_size || duplicateCompany.booth_size,
    };
    
    // 3. Update master company
    const { error: updateError } = await supabase
      .from('companies')
      .update(merged)
      .eq('id', masterCompanyId);
    
    if (updateError) throw updateError;
    
    // 4. Merge tags (add duplicate's tags to master if not already there)
    const { data: duplicateTags } = await supabase
      .from('company_tags')
      .select('tag_id')
      .eq('company_id', duplicateCompanyId);
    
    if (duplicateTags) {
      const { data: masterTags } = await supabase
        .from('company_tags')
        .select('tag_id')
        .eq('company_id', masterCompanyId);
      
      const masterTagIds = new Set(masterTags?.map(t => t.tag_id) || []);
      const tagsToAdd = duplicateTags
        .filter(t => !masterTagIds.has(t.tag_id))
        .map(t => ({
          company_id: masterCompanyId,
          tag_id: t.tag_id
        }));
      
      if (tagsToAdd.length > 0) {
        await supabase.from('company_tags').insert(tagsToAdd);
      }
    }
    
    // 5. Merge assignments (reassign from duplicate to master)
    const { data: duplicateAssignments } = await supabase
      .from('assignments')
      .select('*')
      .eq('company_id', duplicateCompanyId);
    
    if (duplicateAssignments && duplicateAssignments.length > 0) {
      const { data: masterAssignments } = await supabase
        .from('assignments')
        .select('user_id')
        .eq('company_id', masterCompanyId);
      
      const masterUserIds = new Set(masterAssignments?.map(a => a.user_id) || []);
      const assignmentsToAdd = duplicateAssignments
        .filter(a => !masterUserIds.has(a.user_id))
        .map(a => ({
          role: a.role,
          company_id: masterCompanyId,
          user_id: a.user_id
        }));
      
      if (assignmentsToAdd.length > 0) {
        await supabase.from('assignments').insert(assignmentsToAdd);
      }
    }
    
    // 6. Merge notes (add duplicate's notes to master)
    const { data: duplicateNotes } = await supabase
      .from('notes')
      .select('*')
      .eq('company_id', duplicateCompanyId);
    
    if (duplicateNotes && duplicateNotes.length > 0) {
      const notesToAdd = duplicateNotes.map(note => ({
        content: `[Merged from ${duplicateCompany.name}] ${note.content}`,
        company_id: masterCompanyId,
        author_id: note.author_id
      }));
      
      await supabase.from('notes').insert(notesToAdd);
    }
    
    // 7. Log the merge (optional, for audit trail)
    await supabase.from('company_merges').insert({
      master_company_id: masterCompanyId,
      duplicate_company_id: duplicateCompanyId,
      merged_at: new Date().toISOString(),
      merged_data: merged
    }).catch(() => {
      // Table might not exist yet, that's okay
    });
    
    // 8. Delete the duplicate company
    const { error: deleteError } = await supabase
      .from('companies')
      .delete()
      .eq('id', duplicateCompanyId);
    
    if (deleteError) throw deleteError;
    
    return {
      success: true,
      message: `${duplicateCompany.name} a été fusionné avec ${masterCompany.name}`
    };
  } catch (error: any) {
    console.error('Error merging companies:', error);
    return {
      success: false,
      message: `Erreur lors de la fusion : ${error.message}`
    };
  }
}

/**
 * Get all companies and detect duplicates
 */
export async function getAllCompaniesAndDetectDuplicates(): Promise<DuplicateGroup[]> {
  try {
    const { data: companies, error } = await supabase
      .from('companies')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    return detectDuplicates(companies || []);
  } catch (error) {
    console.error('Error detecting duplicates:', error);
    return [];
  }
}
