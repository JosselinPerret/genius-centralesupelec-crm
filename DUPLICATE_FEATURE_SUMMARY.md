# 📦 Résumé des changements - Détection et Fusion de Doublons

## ✅ Fichiers créés

### 1. Service de détection (`/src/lib/duplicate-detection.ts`)
- **Fonction `calculateStringSimilarity()`** : Calcule la similarité entre deux chaînes avec l'algorithme Levenshtein
- **Fonction `levenshteinDistance()`** : Implémentation de l'algorithme Levenshtein
- **Fonction `detectDuplicates()`** : Analyse une liste d'entreprises et détecte les doublons potentiels
- **Fonction `mergeCompanies()`** : Fusionne deux entreprises en consolidant :
  - Données de base
  - Étiquettes
  - Assignations
  - Notes
  - Audit trail
- **Fonction `getAllCompaniesAndDetectDuplicates()`** : Charge toutes les entreprises et détecte les doublons

**Critères de détection :**
- Noms similaires à 85%+
- Email de contact identique (95%)
- Téléphones similaires à 90%+
- Combinaison nom + contact à 85%+
- Doublons exacts (100%)

### 2. Composant UI (`/src/components/companies/DuplicateManager.tsx`)
- **Interface utilisateur complète** pour la détection et fusion de doublons
- **Système d'expansion/collapse** pour explorer les doublons
- **Barre de recherche** pour filtrer par nom d'entreprise
- **Code couleur** pour la similarité (rouge > 90%, jaune 70-90%)
- **Dialog de confirmation** avant fusion
- **Statut de chargement** et gestion des erreurs
- **Toast notifications** pour le feedback utilisateur

**Fonctionnalités :**
- ✅ Bouton "Analyser" pour lancer la détection
- ✅ Affichage des groupes avec raison et score
- ✅ Détails de chaque entreprise avec options de fusion
- ✅ Confirmation avec description des actions
- ✅ Reload automatique après fusion

### 3. Migration Supabase (`/supabase/migrations/20251020_duplicate_detection.sql`)
- Table `company_merges` pour l'audit trail
- Indexes sur `master_company_id` et `merged_at`
- RLS policies pour l'accès en lecture et insertion
- Stockage JSONB des données fusionnées

## 📝 Fichiers modifiés

### 1. `/src/pages/Index.tsx`
```typescript
// Ajout de l'import
import { DuplicateManager } from '@/components/companies/DuplicateManager';

// Ajout de 'duplicates' à validTabs
const validTabs = ['dashboard', 'companies', 'duplicates', 'assignments', 'users', 'tags'];

// Ajout du case dans renderContent()
case 'duplicates':
  return <DuplicateManager />;
```

### 2. `/src/components/layout/Sidebar.tsx`
```typescript
// Ajout de l'import
import { ... Merge2 } from 'lucide-react';

// Ajout du nouvel élément de navigation
const navigation = [
  // ... autres éléments
  {
    id: 'duplicates',
    name: 'Doublons',
    icon: Merge2
  },
  // ... autres éléments
];
```

## 🎯 Intégration

### Routes disponibles
- `/?tab=duplicates` - Onglet de détection des doublons
- Accessible via le menu latéral avec l'icône Merge2

### Structure des données

**Entrée de DuplicateGroup :**
```typescript
interface DuplicateGroup {
  potential: Company[];      // Entreprises en doublon
  similarity: number;        // Score 0-1
  reason: string;           // Raison de la détection
}
```

**Exemple de fusion :**
```
Avant :
- Acme Corp (maître) : name, contact1, email1, phone1
- ACME CORP (doublon) : name, contact2, email2, phone2

Après fusion :
- Acme Corp : name, contact1, email1, phone1 (du maître)
  + étiquettes du doublon
  + assignations du doublon
  + notes du doublon
- ACME CORP : SUPPRIMÉE
```

## 🔧 Utilisation

### Pour le développeur

```typescript
// Détecter les doublons
import { getAllCompaniesAndDetectDuplicates } from '@/lib/duplicate-detection';

const duplicates = await getAllCompaniesAndDetectDuplicates();
console.log(`${duplicates.length} groupes trouvés`);

// Fusionner deux entreprises
import { mergeCompanies } from '@/lib/duplicate-detection';

const result = await mergeCompanies(masterCompanyId, duplicateCompanyId);
if (result.success) {
  console.log('Fusion réussie');
}
```

### Pour l'utilisateur

1. Accédez à l'onglet "Doublons" du menu
2. Cliquez sur "Analyser" pour lancer la détection
3. Explorez les groupes trouvés
4. Vérifiez les détails de chaque entreprise
5. Cliquez "Fusionner avec le premier" sur le doublon
6. Confirmez dans le dialog
7. Les données sont consolidées et l'entreprise en doublon est supprimée

## 📊 Performances

- **Détection** : O(n²) pour n entreprises, optimisée avec early stopping
- **Fusion** : Opération atomique avec gestion des relations
- **Algorithme Levenshtein** : O(m*n) où m et n sont les longueurs des chaînes

## 🔒 Sécurité

- Utilise les RLS policies de Supabase
- Enregistre toutes les fusions pour l'audit
- Confirmation utilisateur requise avant toute fusion
- Validation des données avant fusion

## 📚 Documentation

Voir `DUPLICATE_DETECTION_GUIDE.md` pour :
- Guide complet d'utilisation
- Explications des critères de détection
- Flux de travail recommandé
- Dépannage

## 🚀 Prochaines étapes recommandées

1. **Exécuter la migration Supabase**
   ```bash
   supabase migration up
   ```

2. **Installer les dépendances** (si non présentes)
   ```bash
   npm install lucide-react react react-dom react-router-dom
   ```

3. **Tester la détection**
   - Créer quelques entreprises avec noms similaires
   - Accéder à l'onglet "Doublons"
   - Vérifier que la détection fonctionne

4. **Tester la fusion**
   - Fusionner deux entreprises en doublon
   - Vérifier que les données sont consolidées
   - Vérifier que l'audit trail est créé

## ⚡ Notes importantes

⚠️ **Les fusions ne sont pas réversibles** - Elles sont enregistrées pour l'audit mais pas annulables

✅ **Tout est consolidé** - Aucune donnée n'est perdue lors d'une fusion

🔍 **Vérifiez toujours** - Examinez les détails avant de fusionner

💾 **Sauvegardes** - Supabase crée automatiquement des backups
