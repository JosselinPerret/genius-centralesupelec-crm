# 🧪 Testing Guide - Responsive Design

## Vue d'ensemble des tests à effectuer

Avant de déployer, testez ces scénarios sur:
- 📱 Vrai téléphone (iOS/Android)
- 📊 Tablette
- 🖥️ Desktop
- 🔄 Différentes résolutions

---

## 📱 Tests Téléphone

### Sidebar & Navigation
```
✓ Ouvrir l'app sur téléphone
✓ Vérifier que sidebar est cachée (juste ☰ visible)
✓ Cliquer sur ☰
✓ Sidebar sort de la gauche avec overlay sombre
✓ Cliquer sur "Tableau de bord" ou autre onglet
✓ Sidebar se referme automatiquement
✓ Overlay disparaît
✓ Contenu se met à jour
✓ Mode sombre/clair toggle fonctionne
```

### Dashboard Page
```
✓ Stats cards: 1 par ligne (pas 4!)
✓ Tous les stats cards sont lisibles
✓ Pas de texte qui dépasse
✓ Charts affichent correctement
✓ Pas de scroll horizontal
✓ Boutons assez gros au touch (48px min)
✓ UserRanking cards sont bien formatées
✓ Activité récente: format compact
✓ Pagination (si applicable)
```

### Tableau Entreprises
```
✓ Doit afficher des CARTES, pas une table
✓ Chaque carte montre: Nom, Contact, Statut, Tags
✓ Pas de scroll horizontal dans les cartes
✓ Tags tronqués avec "+X more" si besoin
✓ Boutons "Voir" et "..." visibles et tactiles
✓ Filtres compacts (en popover?)
✓ Pas de débordement
```

### Formulaires (si applicable)
```
✓ Champs en largeur 100%
✓ Labels visibles et lisibles
✓ Clavier n'écrase pas le formulaire
✓ Boutons submitfaciles à cliquer
✓ Messages d'erreur visibles
✓ Pas de contenu caché
```

---

## 📊 Tests Tablette

### Layout
```
✓ Sidebar cachée par défaut (comme mobile)
✓ Ou visible en mode paysage? (décider)
✓ Stats cards: 2 par ligne
✓ Charts côte à côte
✓ Contenu pas trop cramé
```

### Usabilité
```
✓ Pas de zone "morte" non utilisée
✓ Orientation portrait → paysage: layout s'adapte
✓ Orientation paysage → portrait: layout s'adapte
✓ Pas de lag lors du changement d'orientation
```

---

## 🖥️ Tests Desktop

### Layout Original
```
✓ Sidebar toujours visible (pas de hamburger)
✓ Largeur sidebar: 256px
✓ 4 stats cards par ligne
✓ Charts côte à côte
✓ Tout fonctionne comme avant
✓ Pas de régression
```

### Performance
```
✓ Page charge vite
✓ Pas de lag lors du scroll
✓ Charts responsive OK
✓ Pas de scrollbars bizarres
```

---

## 🔍 DevTools Chrome Tests

### Breakpoint Testing
```
1. F12 → Toggle device toolbar (Ctrl+Shift+M)
2. En haut à gauche, cliquer sur le dropdown de resolution
3. Tester ces résolutions:
   - 320px (old iPhone)
   - 375px (iPhone 12)
   - 480px (Galaxy)
   - 640px (Tablet)
   - 768px (iPad)
   - 1024px (Laptop)
   - 1280px (Desktop)
```

### Pour chaque résolution:
```
✓ Aucun scroll horizontal
✓ Aucun débordement
✓ Texte lisible
✓ Boutons clickables
✓ Layout n'est pas cassé
```

### Orientation
```
✓ Portrait: OK
✓ Paysage: OK
✓ Redimensionner en temps réel: smooth
```

---

## 📋 Checklist Détaillée

### Mobile (< 640px)
- [ ] Sidebar caché
- [ ] Hamburger menu visible
- [ ] Stats cards: 1 colonne
- [ ] Charts: responsive
- [ ] Tables: cartes au lieu de tables
- [ ] Padding: `p-4` pas `p-6`
- [ ] Pas de scroll horizontal
- [ ] Texte min 16px
- [ ] Boutons min 44px

### Tablet (640px - 1024px)
- [ ] Sidebar hidden (ou sticky?)
- [ ] Stats cards: 2 colonnes
- [ ] Charts: 2 colonnes
- [ ] Tables: cartes (ou table?)
- [ ] Portrait + Paysage OK
- [ ] Pas de zone "morte"

### Desktop (≥ 1024px)
- [ ] Sidebar visible
- [ ] 4 stats cards
- [ ] 2 charts par ligne
- [ ] Tables: table format
- [ ] Pas de régression
- [ ] Performance OK

---

## 🐛 Bugs Courants à Vérifier

### Sidebar
```
❌ Sidebar reste ouverte après clic
   ✅ Doit se fermer auto
   
❌ Sidebar se ferme trop vite
   ✅ Doit attendre le clic
   
❌ Overlay reste visible
   ✅ Doit disparaître avec sidebar
   
❌ Hamburger invisible
   ✅ Doit toujours être visible sur mobile
```

### Layout
```
❌ Texte dépasse à droite
   ✅ Doit toujours être contained
   
❌ Scroll horizontal présent
   ✅ JAMAIS de scroll horizontal!
   
❌ Boutons trop petits
   ✅ Min 44px en hauteur
   
❌ Charts non responsive
   ✅ Doivent adapter la taille
```

### Performance
```
❌ Lent sur mobile
   ✅ Doit charger rapidement
   
❌ Animation saccadée
   ✅ Smooth transitions
   
❌ Mémoire conso. élevée
   ✅ Optimisée
```

---

## 🎬 Scénarios d'Utilisation

### Scénario 1: Admin sur Téléphone
```
1. Ouvrir app sur téléphone
2. Se connecter
3. Voir le Dashboard
   → Sidebar caché, header fixe
   → Stats cards: 1 colonne
4. Cliquer ☰
   → Sidebar ouvre
   → Overlay visible
5. Cliquer "Entreprises"
   → Sidebar se referme
   → Tableau en cartes (pas table!)
6. Cliquer sur une entreprise
   → Page detail s'ouvre
   → Peut revenir via ☰ ou back button
```

### Scénario 2: Utilisateur sur Tablette (Paysage)
```
1. Ouvrir app sur tablette en paysage
2. Dashboard visible
   → Stats cards: 2 colonnes
   → Charts côte à côte
3. Changer en portrait
   → Stats cards: 1 colonne
   → Charts empilées
4. Changements smooth, pas cassé
```

### Scénario 3: Dev sur Desktop
```
1. Ouvrir app sur desktop (1920px)
2. Tout fonctionne comme avant
3. F12 → Toggle device toolbar
4. Resize à 768px
   → Sidebar disparaît
   → Header mobile apparaît
5. Resize à 1024px
   → Sidebar réapparaît
   → Header disparaît
6. Transitions smooth
```

---

## 📊 Rapport de Test

### Template à utiliser:

```
## Test Date: [DATE]
## Testeur: [NOM]

### Mobile (iPhone/Android)
- Sidebar: ✓/✗
- Stats: ✓/✗
- Tables: ✓/✗
- Forms: ✓/✗
- Perf: ✓/✗

### Tablet
- Portrait: ✓/✗
- Landscape: ✓/✗
- Layout: ✓/✗

### Desktop
- Layout: ✓/✗
- Perf: ✓/✗
- Regression: ✓/✗

### Issues trouvées:
1. [Description]
2. [Description]

### Notes:
[Commentaires généraux]
```

---

## 🚀 Déploiement Checklist

Avant de merger/déployer:

- [ ] ✅ Tests mobile OK
- [ ] ✅ Tests tablet OK
- [ ] ✅ Tests desktop OK
- [ ] ✅ Pas de scroll horizontal
- [ ] ✅ Performance acceptable
- [ ] ✅ Pas de console errors
- [ ] ✅ Sidebar toggle fonctionne
- [ ] ✅ Dark mode toggle OK
- [ ] ✅ Tous les onglets responsive
- [ ] ✅ Documentation à jour
- [ ] ✅ Code review faite
- [ ] ✅ Pas de breaking changes

---

## 📞 Support Tests

### Si vous trouvez un bug:

1. **Note the resolution** (ex: 375px, 768px)
2. **Take screenshot** or video
3. **Describe the issue** (ex: "Sidebar doesn't close")
4. **Trace the steps** to reproduce
5. **Check console** for errors (F12)

### Bug Report Template:
```
## Bug: [Titre court]

### Device
- Type: [Mobile/Tablet/Desktop]
- Resolution: [ex: 375px]
- Browser: [Chrome/Safari/Firefox]
- OS: [iOS/Android/macOS/Windows]

### Expected
[Ce qui devrait se passer]

### Actual
[Ce qui se passe réellement]

### Steps
1. ...
2. ...
3. ...

### Screenshot/Video
[Attachez une image ou vidéo]

### Console Error
[S'il y a une erreur en F12]
```

---

**Guide créé**: 16 octobre 2025  
**Version**: 1.0  
**Statut**: ✅ Ready for Testing
