# Quick Reference: Bulk Random Assignment Feature

## 🎯 What This Does

Admin/Manager can now randomly distribute unassigned companies to multiple users equally.

**Example**: 100 unassigned companies → split equally among 5 users (20 each)

---

## 📍 Where to Find It

**Page**: Affectations (Assignments)  
**Role Required**: Admin or Manager  
**Position**: Top of page, above individual assignment form

---

## ⚡ Quick Start

### For Admins/Managers:

1. Go to **Affectations** page
2. Look for **"Affectation Aléatoire en Masse"** card (top)
3. Set **"Entreprises par utilisateur"** (e.g., 10)
4. Click **"Sélectionner tout"** or manually check users
5. Review the summary
6. Click **"Créer les affectations aléatoires"**
7. Confirm in the dialog
8. ✅ Done! Companies are now assigned

---

## 🔧 Configuration Options

| Option | Purpose | Example |
|--------|---------|---------|
| Companies per User | How many companies each user gets | 10 |
| Select Users | Choose who receives assignments | John, Jane, Bob |
| Select All | Quick select everyone | One click selects all |

---

## 📊 Statistics Displayed

Shows real-time info:
- Total users available
- Unassigned companies
- Total assignments that will be created

---

## ✅ Validation

System prevents invalid operations:
- ❌ No users selected → Button disabled
- ❌ Not enough companies → Warning shown, button disabled
- ✅ Valid config → Button enabled

---

## 🎲 How Distribution Works

1. All unassigned companies are shuffled randomly
2. Each selected user gets exactly the same number
3. Companies are distributed fairly among users
4. No company assigned twice
5. Result: Fair, random distribution

**Example with 3 users, 2 companies each from pool of 12:**
- User A: Companies #3, #9 (random)
- User B: Companies #1, #12 (random)
- User C: Companies #7, #4 (random)

---

## 📋 Before You Execute

✓ Check unassigned company count is sufficient  
✓ Select correct users  
✓ Set reasonable company count  
✓ Review summary before confirming

---

## ⚠️ Important Notes

- **Only unassigned companies** are used
- **Fair distribution** - everyone gets the same amount
- **Random selection** - companies shuffled before assignment
- **Confirmation required** - dialog prevents accidents
- **Cannot undo easily** - remove individually or contact admin

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Card not visible | Check you're Admin/Manager |
| "Not enough companies" | More companies needed |
| "No users selected" | Check at least one user |
| Button greyed out | Check all validation rules |

---

## 💡 Pro Tips

1. **Batch Operations**: Assign all unassigned companies at once
2. **Equal Distribution**: Always give each user same count
3. **Use Select All**: Faster than checking individually
4. **Verify Summary**: Double-check before confirming
5. **Check Stats**: Use dashboard to monitor total assignments

---

## 📈 Typical Workflow

```
Monday Morning:
├─ CSV import 150 new companies
├─ Go to Affectations page
├─ See 150 unassigned companies
├─ Set to 10 per user
├─ Select all 15 managers
├─ Confirm (150 assignments created)
└─ ✅ Everyone has 10 companies to contact
```

---

## 🔐 Access Control

| Role | Can Use? |
|------|----------|
| Admin | ✅ Yes |
| Manager | ✅ Yes |
| Volunteer | ❌ No |

---

## 📞 Support

**Question**: Can I assign to the same user twice?  
**Answer**: No, companies are distributed evenly.

**Question**: Can I undo assignments?  
**Answer**: Yes, but individually in the assignments section.

**Question**: Can volunteers see this feature?  
**Answer**: No, it's admin/manager only.

---

## 🎓 Real-World Examples

### Example 1: New Volunteers
```
Scenario: 20 new volunteers, 100 unassigned companies
Config: 5 companies per volunteer
Result: All 100 companies assigned, everyone has 5
```

### Example 2: Equal Workload
```
Scenario: 3 managers, 30 companies to assign
Config: 10 companies per manager
Result: Equal distribution, fair workload
```

### Example 3: Partial Assignment
```
Scenario: Only assign to active users
Config: Select only 5 of 10 users, 8 companies each
Result: 5 users get 40 companies total, 5 left unassigned
```

---

## ✨ Key Features Summary

- 🎲 **Random** - Fair randomization algorithm
- ⚖️ **Equal** - Everyone gets same count
- 🚀 **Fast** - Bulk operation in seconds
- 🛡️ **Safe** - Confirmation dialog prevents errors
- 📊 **Smart** - Real-time validation
- 🎯 **Precise** - Only unassigned companies
- 📱 **Responsive** - Works on all devices

---

**Last Updated**: October 2025  
**Status**: ✅ Production Ready
