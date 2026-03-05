# 01 - Overview

**Sarak UI Engine** is a proprietary interface framework designed to create high-impact digital experiences, focusing on premium aesthetics, performance, and total modularity (Plug-and-Play).

## 💎 Design Philosophy

Sarak's visual identity is based on three pillars:

1.  **Active Glassmorphism**: Strategic use of transparency, blurs, and luminescent edges that react to the context.
2.  **Functional Luxury**: Curated typography (Inter, Syne, Cabinet Grotesque) and generous spacing that convey authority.
3.  **Micro-interactions**: Immediate visual feedback through subtle animations (`framer-motion`) and dynamic hover states.

## 🏗️ `core/` Module Structure

The engine is organized to separate "Interface Intelligence" from "Project Logic":

-   `/auth`: Agnostic Login system and route protection.
-   `/components`: Structural Shell components (Sidebar, Modals, Widgets).
-   `/contexts`: `ThemeContext` - The brain that manages the global visual state.
-   `/styles`: Where CSS lives in a sliced format (Base, Themes, Components, Textures).
-   `/theme-library`: Library of color, font, and effect presets.

## 🚀 Plug-and-Play Capabilities

Sarak was designed so you can:
1. Copy the `core/` folder.
2. Configure `sarak.config.jsx`.
3. Have a functional and beautiful dashboard in less than 5 minutes.
