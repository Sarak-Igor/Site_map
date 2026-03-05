# 02 - Installation and Integration Guide

To integrate the Sarak UI Engine into a new React project, follow the steps below.

## 🛠️ Prerequisites

Ensure your project has the following dependencies installed:

```bash
npm install lucide-react framer-motion tailwindcss @tailwindcss/vite postcss react-router-dom
```

> [!IMPORTANT]
> Sarak UI was optimized for **Tailwind CSS v4**. Using previous versions may require adjustments to theme variables.

## 🔌 Integration Step-by-Step

### 1. File Transfer
Copy the `src/core` folder entirely to the `src/` directory of your new project.

### 2. CSS Loader Configuration
In your main CSS file (e.g., `index.css`), replace the content with:

```css
@import "tailwindcss";
@import "./core/styles/base.css";
@import "./core/styles/themes.css";
@import "./core/styles/components.css";
@import "./core/styles/textures.css";
```

### 3. The Configuration File (`sarak.config.jsx`)
Create a file at the root of your `src/` called `sarak.config.jsx` to define your system's personality:

```javascript
import { Layout, BarChart, Settings } from 'lucide-react';

export const SarakConfig = {
    branding: {
        name: "Sarak Engine",
        version: "V1.0",
        logo: null // You can pass an SVG component here
    },
    defaultTab: 'dashboard',
    navigation: [
        { id: 'dashboard', label: 'Dashboard', icon: <BarChart /> },
        { id: 'settings', label: 'Settings', icon: <Settings /> }
    ],
    modules: [
        { id: 'main-plugin', name: "Main Module" }
    ]
};
```

### 4. Initialization at the entry point (`App.jsx`)
Wrap your application with the necessary providers:

```javascript
import { ThemeProvider } from './core/contexts/ThemeContext';
import SarakShell from './core/components/SarakShell';
import { SarakConfig } from './sarak.config';

function App() {
  return (
    <ThemeProvider>
       <SarakShell 
          config={SarakConfig} 
          renderContent={(activeTab) => <YourComponent tab={activeTab} />} 
          user={{ name: "Admin" }}
          onLogout={() => {}}
       />
    </ThemeProvider>
  );
}
```
