# 🚀 Guide d'Installation - Détection et Fusion de Doublons

## Prérequis

- Node.js 16+ et npm/yarn/bun
- Supabase CLI
- Accès administrateur au projet

## 1️⃣ Installation et Configuration

### Étape 1: Vérifier les dépendances

Assurez-vous que tous les packages sont installés:

```bash
npm install
# ou
yarn install
# ou
bun install
```

Les packages nécessaires:
- `react` et `react-dom` (déjà présents)
- `react-router-dom` (déjà présent)
- `lucide-react` (icônes)
- `tailwindcss` (styling - déjà présent)

### Étape 2: Migration Supabase

Exécutez la migration pour créer la table d'audit `company_merges`:

```bash
# Depuis le répertoire du projet
supabase migration up
```

Ou via Supabase Studio (Web UI):

1. Accédez à [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Ouvrez votre projet
3. Allez à "SQL Editor"
4. Copiez et exécutez le contenu du fichier:
   ```
   supabase/migrations/20251020_duplicate_detection.sql
   ```

### Étape 3: Vérifier les fichiers

Assurez-vous que ces fichiers existent:

```
src/
├── lib/
│   ├── duplicate-detection.ts          ✅ Service principal
│   └── duplicate-detection.test.ts     ✅ Tests
├── components/
│   └── companies/
│       └── DuplicateManager.tsx        ✅ Composant UI
├── pages/
│   └── Index.tsx                       ✅ Modifié
├── components/
│   └── layout/
│       └── Sidebar.tsx                 ✅ Modifié

supabase/
└── migrations/
    └── 20251020_duplicate_detection.sql ✅ Migration
```

## 2️⃣ Démarrer l'Application

```bash
# Mode développement
npm run dev

# La page d'accueil sera disponible sur http://localhost:5173
```

## 3️⃣ Accéder à la Fonctionnalité

### Via le navigateur

1. Ouvrez http://localhost:5173
2. Connectez-vous avec votre compte
3. Cliquez sur "Doublons" dans le menu latéral

### Via l'URL

```
http://localhost:5173/?tab=duplicates
```

## 4️⃣ Tester la Détection

### Créer des données de test

1. Créez des entreprises avec des noms similaires:
   - "Acme Corp" et "ACME Corporation"
   - "Tech Solutions" et "Tech Solutions Inc"

2. Créez des entreprises avec emails identiques

3. Créez des entreprises avec téléphones similaires

### Lancer la détection

1. Allez à l'onglet "Doublons"
2. Cliquez sur le bouton "Analyser"
3. Vous devriez voir les doublons détectés

## 5️⃣ Fusion des Doublons

### Avant la fusion

- ✅ Examinez les deux entreprises
- ✅ Vérifiez le score de similarité
- ✅ Identifiez l'entreprise "maître" (celle à conserver)

### Processus de fusion

1. Cliquez sur "Fusionner avec le premier"
2. Vérifiez les détails dans le dialog
3. Cliquez "Fusionner"
4. Attendez la confirmation
5. La fusion est effectuée et enregistrée

### Après la fusion

- L'entreprise en doublon est supprimée
- L'entreprise maître conserve ses données
- Les étiquettes et assignations sont fusionnées
- Les notes sont consolidées
- Un enregistrement d'audit est créé

## 6️⃣ Déploiement en Production

### Préparation

```bash
# Vérifier que tout compile
npm run build

# Les erreurs TypeScript doivent être résolues
```

### Déployer les fichiers

Les fichiers suivants doivent être inclus dans le déploiement:

```
src/lib/duplicate-detection.ts
src/components/companies/DuplicateManager.tsx
(modifications mineurs de Index.tsx et Sidebar.tsx)
```

### Exécuter la migration

```bash
# En production
supabase migration up --linked

# Ou dans Supabase Studio
```

### Vérifier le déploiement

1. Accédez à l'application déployée
2. Connectez-vous
3. Allez à l'onglet "Doublons"
4. Testez la détection et la fusion

## 7️⃣ Dépannage

### "Impossible de trouver le module duplicate-detection"

**Solution**: Assurez-vous que le fichier `src/lib/duplicate-detection.ts` existe

```bash
# Vérifier
ls -la src/lib/duplicate-detection.ts
```

### "Onglet Doublons n'apparaît pas"

**Causes possibles:**
1. Le fichier `DuplicateManager.tsx` n'existe pas
2. L'import n'est pas dans `Index.tsx`
3. Le navigateur cache les données

**Solution:**
```bash
# Effacer le cache
npm run clean  # ou rm -rf dist/

# Redémarrer
npm run dev
```

### "La fusion est lente"

**Causes possibles:**
1. Nombreuses relations (assignations, notes, tags)
2. Connexion réseau lente
3. Base de données surchargée

**Solution:**
- Attendre que le processus se termine
- Vérifier la connexion
- Vérifier les logs Supabase

### "Erreur: RLS policy violation"

**Causes possibles:**
1. L'utilisateur n'a pas les droits d'accès
2. Les RLS policies ne sont pas correctement configurées

**Solution:**
1. Vérifier les RLS policies dans Supabase
2. Vérifier que l'utilisateur est admin
3. Vérifier les logs d'erreur

## 8️⃣ Scripts utiles

### Exécuter les tests

```bash
# Si Jest est configuré
npm test -- src/lib/duplicate-detection.test.ts

# Ou manuellement dans la console du navigateur
import { testDuplicateDetection } from '@/lib/duplicate-detection.test';
testDuplicateDetection();
```

### Nettoyer la base de données

```bash
# Via Supabase SQL Editor
DELETE FROM company_merges;  -- Effacer l'historique de fusion
```

## 9️⃣ Configuration Avancée

### Ajuster les seuils de similarité

Modifiez `src/lib/duplicate-detection.ts`:

```typescript
// Ligne 45: Similitude du nom
if (nameSimilarity > 0.85) {  // ← Changer ce seuil
  // ...
}

// Ligne 58: Similitude du téléphone
if (phoneSimilarity > 0.9) {  // ← Changer ce seuil
  // ...
}
```

### Ajouter de nouveaux critères de détection

Modifiez la fonction `detectDuplicates()` dans `src/lib/duplicate-detection.ts`:

```typescript
// Ajouter après les critères existants
const customCriteria = // ... votre logique
if (customCriteria) {
  similarity = Math.max(similarity, yourScore);
  reason = 'Votre raison';
}
```

## 🔟 Maintenance

### Sauvegarde régulière

Supabase crée automatiquement des sauvegardes, mais vous pouvez aussi:

```bash
# Exporter les données
supabase db dump > backup.sql

# Restaurer si nécessaire
supabase db restore < backup.sql
```

### Monitoring

Vérifiez régulièrement:
1. La table `company_merges` pour les fusions
2. Les logs d'erreur dans la console navigateur
3. L'espace disque utilisé dans Supabase

### Nettoyage

```bash
-- Supprimer les anciennes fusions (> 1 an)
DELETE FROM company_merges 
WHERE merged_at < now() - interval '1 year';
```

## 📞 Support et Ressources

- Documentation: `DUPLICATE_DETECTION_GUIDE.md`
- Résumé: `DUPLICATE_FEATURE_SUMMARY.md`
- Code source: `src/lib/duplicate-detection.ts`
- Composant: `src/components/companies/DuplicateManager.tsx`

## ✅ Checklist de déploiement

- [ ] Toutes les dépendances sont installées
- [ ] La migration Supabase est exécutée
- [ ] Les fichiers sont présents
- [ ] L'onglet "Doublons" apparaît dans le menu
- [ ] La détection fonctionne
- [ ] La fusion fonctionne
- [ ] L'audit trail est enregistré
- [ ] Les tests passent
- [ ] La documentation est à jour

Vous êtes prêt! 🎉
