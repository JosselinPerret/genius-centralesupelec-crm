# Bulk Random Assignment Feature

## Overview
A new feature has been added to the **Affectations** (Assignments) page that allows **Admin** and **Manager** users to automatically assign unassigned companies to multiple users in a random and equitable manner.

## Files Modified/Created

### New File
- **`src/components/assignments/BulkRandomAssignment.tsx`** - New component for bulk random assignment functionality

### Modified File
- **`src/components/assignments/AssignmentManager.tsx`** - Integrated the new BulkRandomAssignment component

## Features

### 1. **Bulk Random Assignment Component**
A dedicated card appears on the Affectations page (visible only to Admin/Manager users) with the following capabilities:

#### Dashboard Statistics
- **Utilisateurs Disponibles** - Count of all available users
- **Entreprises Non Assignées** - Count of companies without any assignments
- **Affectations à Créer** - Real-time preview of total assignments that will be created

#### Configuration
- **Enterprises per User Input** - Configurable number (e.g., 10 companies per user)
- Users can set how many companies each selected user will receive

#### User Selection
- **Select Users** - Multi-select checkboxes to choose which users receive assignments
- **Select All / Deselect All** - Quick toggle to select/deselect all users at once
- Users are displayed with their name and role badge

#### Validation & Safety
- **Real-time validation** - Prevents creation if there aren't enough unassigned companies
- **Warning messages** - Clear summary of what will happen before confirmation
- **Confirmation dialog** - Requires explicit confirmation before performing the bulk operation
- **Error handling** - Graceful error messages if something goes wrong

### 2. **Assignment Algorithm**
The algorithm ensures:
- ✅ **Random distribution** - Companies are shuffled randomly
- ✅ **Equitable assignment** - Each selected user gets exactly the same number of companies
- ✅ **No duplicates** - Each company is assigned to exactly one user
- ✅ **No conflicts** - Only unassigned companies are used (companies already assigned to other users are skipped)

## How It Works

### Step-by-Step Flow

1. **Access the Feature**
   - Go to the "Affectations" (Assignments) page
   - Only Admin and Manager users see the "Affectation Aléatoire en Masse" card

2. **Review Available Resources**
   - Check the statistics to see how many users and unassigned companies are available

3. **Configure Settings**
   - Enter the number of companies each user should receive
   - The form will show: `selectedUsers × companiesPerUser = total affectations`

4. **Select Users**
   - Check the boxes next to users who should receive assignments
   - Use "Select All" to quickly select all users
   - The preview updates in real-time

5. **Validation Check**
   - The system warns if there aren't enough unassigned companies
   - The submit button is disabled if invalid

6. **Confirmation**
   - Click "Créer les affectations aléatoires" (Create random assignments)
   - A confirmation dialog appears showing exactly what will happen
   - Review the summary and confirm

7. **Success**
   - Assignments are created instantly
   - Success toast shows how many affectations were created
   - Page data refreshes automatically

## Example Usage Scenario

### Scenario
- You have 100 unassigned companies
- You have 10 volunteers
- You want to distribute them equally

**Configuration:**
1. Set "Entreprises par utilisateur" to 10
2. Click "Sélectionner tout" to select all 10 users
3. The preview shows: "10 utilisateur(s) recevront 10 entreprise(s) chacun = 100 affectations au total"
4. Click confirm
5. ✅ Each volunteer now has exactly 10 companies assigned randomly

## Technical Details

### Database Operations
- Fetches all users from `profiles` table
- Fetches all companies from `companies` table
- Queries `assignments` table to find already-assigned companies
- Inserts bulk assignments in a single batch operation

### User Permissions
- **Only Admin and Manager** can access this feature
- The component is conditionally rendered based on `currentUserRole`
- Volunteers do not see the bulk assignment card

### State Management
- Uses React hooks (useState, useEffect)
- Manages selected users with a Set (for efficient lookups)
- Real-time calculation of total affectations
- Loading and processing states for better UX

### Error Handling
- Toast notifications for all success/error scenarios
- Validation prevents impossible operations
- Clear error messages guide users to fix issues

## UI/UX Features

### Visual Feedback
- 🎨 Color-coded statistics cards
- ⚠️ Warning boxes for edge cases
- ✓ Green success messages
- ✗ Red error messages with descriptions

### Responsiveness
- Responsive grid layout for statistics
- Mobile-friendly user selection list
- Proper spacing and padding throughout

### Accessibility
- Clear labels for all inputs
- Checkbox labels are clickable
- Disabled states for unavailable actions
- Confirmation dialog prevents accidental operations

## Limitations & Notes

1. **Minimum Requirements**
   - At least one user must be selected
   - At least one unassigned company must exist
   - Total companies needed must not exceed available unassigned companies

2. **Data Integrity**
   - Each company can only be assigned once
   - The system checks for existing assignments before processing
   - If the user count changes during operation, validation prevents issues

3. **Performance**
   - Suitable for up to several hundred companies and users
   - Batch insert is used for efficiency
   - Shuffle algorithm uses random sort

## Future Enhancement Ideas

1. **Role Selection** - Specify which role assignments should have
2. **Status Filter** - Only assign companies with specific statuses
3. **Exclusion List** - Exclude specific users or companies from bulk assignment
4. **Assignment History** - View logs of bulk assignments performed
5. **Preview List** - Show which specific companies will be assigned before confirming
6. **Export Results** - Export the assignment results to CSV

## Integration Notes

The feature is fully integrated with:
- Existing authentication system
- Current data models and types
- Existing Supabase client configuration
- Current UI component library (shadcn/ui)

No database schema changes were required - all existing tables are used.
