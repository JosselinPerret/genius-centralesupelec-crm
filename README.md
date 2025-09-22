# Enterprise Elysium CRM

A comprehensive Customer Relationship Management (CRM) system built with modern web technologies.

## Features

### Core Functionality
- **Dashboard**: Overview of system statistics and key metrics
- **Company Management**: Create, read, update, and delete company records
- **User Management**: Handle user profiles and role assignments
- **Tag System**: Organize companies with customizable tags
- **Notes System**: Add and manage notes for companies
- **Assignments**: Users can assign themselves to companies with specific roles

### Assignment System
The assignment system allows users to:
- **Self-assign to companies**: Users can assign themselves to companies with different roles
- **Role management**: Choose from predefined roles (Contact Person, Collaborator, Representative, Consultant)
- **Search and filter**: Find companies easily with search functionality
- **Track assignment history**: View when assignments were created
- **Remove assignments**: Users can remove their own assignments

### User Roles
- **ADMIN**: Full system access and management capabilities
- **MANAGER**: Can manage companies, assignments, and tags
- **VOLUNTEER**: Can view data and manage their own assignments

### Security Features
- Row Level Security (RLS) policies for data protection
- User authentication with Supabase Auth
- Role-based access control
- Secure API endpoints

## Project info

**URL**: https://lovable.dev/projects/a53d3c9b-71f5-4b40-aed3-21a309469196

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/a53d3c9b-71f5-4b40-aed3-21a309469196) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/a53d3c9b-71f5-4b40-aed3-21a309469196) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
