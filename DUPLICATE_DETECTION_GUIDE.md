# Fonctionnalité de Détection et Fusion de Doublons

## Vue d'ensemble

La fonctionnalité de détection et fusion de doublons permet d'identifier les entreprises en doublon dans votre base de données et de les fusionner de manière intelligente.

## Comment ça marche

### Détection des doublons

L'algorithme de détection utilise plusieurs critères pour identifier les doublons potentiels :

1. **Similarité du nom** (algorithme Levenshtein)
   - Détecte les noms très similaires
   - Seuil : 85% de similarité

2. **Email de contact identique**
   - Deux entreprises avec le même email contact sont considérées comme doublons
   - Similarité : 95%

3. **Numéros de téléphone similaires**
   - Supprime les caractères non-numériques et compare
   - Seuil : 90% de similarité

4. **Nom de contact + nom d'entreprise**
   - Combine les deux critères pour une détection plus précise
   - Seuil : 85% pour chaque

5. **Doublons exacts**
   - Même nom, même email, même téléphone
   - Similarité : 100%

### Score de similarité

Chaque groupe de doublons reçoit un score de similarité :
- **> 90%** : Rouge - Très probablement des doublons
- **70-90%** : Jaune - Probablement des doublons, vérifier manuellement

## Fusion des doublons

Quand vous fusionnez deux entreprises :

1. **L'entreprise "maître" conserve ses données**
2. **Les données complémentaires** du doublon sont fusionnées :
   - Contact name : complété si absent
   - Contact email : complété si absent
   - Téléphone : complété si absent
   - Booth details : fusionnés

3. **Les données associées** sont consolidées :
   - ✅ **Étiquettes** : Toutes les étiquettes du doublon sont ajoutées
   - ✅ **Assignations** : Les assignations sont transférées (pas de doublons)
   - ✅ **Notes** : Les notes du doublon sont incorporées avec un préfixe
   - ✅ **Audit** : Un enregistrement de fusion est créé pour la traçabilité

4. **L'entreprise en doublon est supprimée**

## Interface utilisateur

### Onglet "Doublons"

Accessible depuis le menu principal, l'onglet "Doublons" offre :

- **Bouton "Analyser"** : Lance une analyse complète de tous les doublons
- **Barre de recherche** : Filtrer les doublons par nom d'entreprise
- **Groupes de doublons** :
  - Affichage de la raison de la détection
  - Score de similarité avec code couleur
  - Nombre de résultats
  - Détails expansibles de chaque entreprise en doublon

### Dialog de confirmation

Avant de fusionner, vous devez :
1. Choisir l'entreprise "maître" (première dans la liste)
2. Sélectionner le doublon à fusionner
3. Confirmer la fusion avec le dialog de confirmation qui récapitule :
   - Les données qui seront conservées
   - Les données qui seront fusionnées
   - Les données qui seront transférées

## Exemple de workflow

1. Allez à l'onglet "Doublons"
2. Cliquez sur "Analyser"
3. Vous voyez "2 groupes de doublons trouvés"
4. Expandez le premier groupe
5. Examinez les entreprises :
   - "Acme Corp" (maître)
   - "ACME CORP" (doublon - 95% similaire)
6. Cliquez "Fusionner avec le premier"
7. Confirmez la fusion
8. Les données sont consolidées et l'entreprise en doublon est supprimée
9. Recommencez l'analyse pour vérifier qu'il n'y a plus de doublons

## Algorithme de similarité (Levenshtein)

L'algorithme Levenshtein calcule la distance minimale d'éditions (insertions, suppressions, substitutions) entre deux chaînes.

Formule de similarité :
```
Similarité = 1 - (distance / longueur_max)
```

Exemples :
- "Acme Corp" vs "ACME CORP" → 95% similaire
- "Microsoft" vs "Microsft" → 88% similaire
- "Apple Inc" vs "Apple Inc" → 100% similaire

## Base de données

### Table `company_merges` (audit)

Enregistre toutes les fusions pour la traçabilité :

```sql
CREATE TABLE company_merges (
  id UUID PRIMARY KEY,
  master_company_id UUID,
  duplicate_company_id TEXT,
  merged_at TIMESTAMP,
  merged_data JSONB,
  created_at TIMESTAMP
);
```

## Limitations et considérations

### ⚠️ Limitations

1. **Non-réversible** : Les fusions ne peuvent pas être annulées facilement
2. **Données sensibles** : Vérifiez toujours les détails avant de fusionner
3. **Assignations** : Les assignations du doublon ne sont transférées que si l'utilisateur n'était pas déjà assigné au maître
4. **Statut** : Le statut du maître est toujours préservé

### 🔒 Recommandations de sécurité

1. **Vérifier les détails** avant toute fusion
2. **Consulter l'équipe** pour les fusions massives
3. **Examiner l'historique** des notes fusionnées
4. **Sauvegarder régulièrement** (Supabase backups)

## Fonctionnalités futures possibles

- [ ] Fusion automatique pour les doublons exacts (100%)
- [ ] Historique et annulation des fusions
- [ ] Fusions en masse avec validation
- [ ] Règles personnalisées de détection
- [ ] Notifications avant fusion
- [ ] Comparaison visuelle détaillée

## Dépannage

### "Aucun doublon détecté"
- La base de données ne contient probablement pas de doublons
- Vérifiez les critères de détection ci-dessus
- Essayez d'ajouter des entreprises test

### Les doublons ne sont pas fusionnés
- Vérifiez les permissions (RLS policies)
- Vérifiez la connexion à Supabase
- Vérifiez les logs du navigateur

### La fusion est lente
- Cela peut être normal pour de nombreuses assignations/notes
- Attendez que le process se termine
- Vérifiez la connexion réseau
