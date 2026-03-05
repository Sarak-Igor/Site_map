# 04 - Extending the Core System

Sarak was designed to be extended without the need to modify base files (`ThemeContext`, `SarakShell`).

## ⚙️ Adding New Global Features

If you need a new feature that appears throughout the system (e.g., a global search bar or a support chat):

1.  Create your component in `src/core/components/YourNewFunc.jsx`.
2.  Inject it into `SarakShell.jsx` within the desired area (e.g., inside the `main` or the `aside`).

## ⌨️ Creating New Shortcuts

The shortcut system is dynamic. To register a shortcut on any screen:

```javascript
import { useShortcut } from '../core/hooks/useShortcut';

const MyScreen = () => {
    useShortcut(
        { id: 'my:action', name: "Shortcut Text", category: "My Commands" }, 
        () => alert('Action executed!')
    );
    // ...
}
```
*Shortcuts registered with `useShortcut` automatically appear in the Shortcut Modal (Ctrl + /).*

## 🔴 Creating Compatible UI Components

When creating new buttons or cards, use the theme variables so they change color with the system:

```jsx
<div className="bg-theme-card border border-theme-border rounded-theme p-4 hover:shadow-glow transition-all">
    <h3 className="text-theme-title font-heading">Title</h3>
    <p className="text-theme-muted">Description</p>
</div>
```

**Recommended utility classes:**
- `.bg-theme-body`: Main background.
- `.bg-theme-card`: Background for cards/content areas.
- `.text-theme-title`: Highlight color for titles.
- `.text-theme-main`: Default text color.
- `.text-theme-primary`: User-selected accent color.
- `.border-theme-border`: Soft border color.
