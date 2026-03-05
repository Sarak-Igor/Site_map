# 05 - Technical Architecture

This document details Sarak Engine's internal workings for developers who need to perform deep maintenance.

## 🧠 Theme Data Flow

The system uses `ThemeContext.jsx` (located in `core/contexts/`) as the single source of truth for the visual state.

1.  **State Management**: The context stores the active `layout`, the `mode` (light/dark), the `primaryColor`, and the `fontScale`.
2.  **Persistence**: Every change is automatically saved to `localStorage` under the `sarak_` prefix.
3.  **CSS Injection**: The context's `useEffect` injects CSS variables directly into the `document.documentElement` and utility classes into `document.body`.

## 🏗️ CSS Layers (Tailwind v4)

Styling follows a priority hierarchy to ensure the Premium Design System is not accidentally broken:

1.  **`base.css`**: Defines fundamental tokens.
2.  **`themes.css`**: Overwrites base tokens with specific values for each theme.
3.  **Components**: Component-specific styles (e.g., `.custom-scrollbar`).
4.  **Utilities**: Tailwind utility classes (e.g., `p-4`, `flex`).

## ⚡ Automated Translation System

`GoogleTranslateWidget.jsx` acts as a wrapper around the legacy Google Translate script.
- **Injection**: The script is loaded asynchronously.
- **Trigger**: The application does not use `i18next`. It changes the `googtrans` cookie and forces a reload/re-render so that the Google engine translates the DOM dynamically.
- **Advantage**: Supports new languages instantly without the need for translation JSON files.

## 🧩 SarakShell Lifecycle

`SarakShell` is the "Wrapper" component. It:
1. Receives configuration via `sarak.config.jsx`.
2. Registers global shortcuts.
3. Manages Sidebar "Resizing" state.
4. Renders module content via the `renderContent` prop.
