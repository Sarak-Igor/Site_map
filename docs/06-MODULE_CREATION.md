# 06 - Module Creation Guide

This guide outlines the standard procedure for creating and integrating a new business module inside the Sarak Engine Boilerplate.

The **Sarak UI Engine** (`src/core/`) is fully agnostic. All your project-specific screens and logic should live under `src/modules/`.

## 🛠️ Step 1: Create the Module Skeleton

First, create a new directory for your domain/feature inside `src/modules/`. For this example, let's create a "Financial Dashboard".

```bash
mkdir -p src/modules/financial/components
```

Create an entry point for your module. The module acts as a middle-man that receives the `activeTab` from Sarak Shell and renders the appropriate screen.

**File:** `src/modules/financial/FinancialModule.jsx`

```javascript
import React from 'react';

const OverviewScreen = () => (
   <div className="p-8">
       <h1 className="text-2xl font-bold text-theme-title">Financial Overview</h1>
       <p className="text-theme-muted">Welcome to the financial dashboard.</p>
   </div>
);

const ReportsScreen = () => (
   <div className="p-8">
       <h1 className="text-2xl font-bold text-theme-title">Reports</h1>
   </div>
);

const FinancialModule = ({ activeTab }) => {
   // Route according to the sidebar tab clicked
   if (activeTab === 'overview') return <OverviewScreen />;
   if (activeTab === 'reports') return <ReportsScreen />;
   
   return <div>Screen not found.</div>;
};

export default FinancialModule;
```

## 🔌 Step 2: Register the Module in SarakConfig

Go to the root entry point `src/App.jsx`. You need to inform the UI Engine that your module exists so it appears in the Module Selector and Sidebar.

Update the `SarakConfig` constant:

```javascript
import { DollarSign, FileText, PieChart } from 'lucide-react';

const SarakConfig = {
  branding: {
    title: "Sarak System",
    subtitle: "Enterprise Engine"
  },
  defaultTab: 'overview',
  // Define Sidebar tabs
  navigation: [
      { id: 'overview', label: 'Overview', icon: <PieChart /> },
      { id: 'reports', label: 'Reports', icon: <FileText /> }
  ],
  // Define Top-bar Modules
  modules: [
    { id: 'financial', name: 'Finance Hub', icon: <DollarSign className="w-4 h-4" /> }
  ]
};
```

## 🚀 Step 3: Inject the Module into AppContent

Finally, tell the `AppContent` router to render your module when it is selected by the user.

In `src/App.jsx`, import your module and update the `renderContent` function:

```javascript
import FinancialModule from './modules/financial/FinancialModule';

const AppContent = () => {
  // ... existing hooks
  
  const renderContent = (tab) => {
    // Determine which module to load based on the Top-bar selection
    if (currentModule === 'financial') {
        return <FinancialModule activeTab={tab} />;
    }
    
    // Add other modules here:
    // if (currentModule === 'hr') return <HRModule activeTab={tab} />;

    return <WelcomeScreen />;
  };

  return (
    // ... Routes and SarakShell remain untouched
  );
};
```

## ✅ Conclusion
Congratulations! Your `FinancialModule` is now seamlessly integrated into the Agnostic Sarak Engine. It inherits the Global Theme, translations, shortcut hooks, and layout rules automatically.
