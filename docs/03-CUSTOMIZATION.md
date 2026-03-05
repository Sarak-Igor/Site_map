# 03 - Customization and Themes

Sarak Engine is highly customizable through CSS variables and JavaScript presets.

## 🎨 Creating a New Native Theme

Native themes (Presets) are located in `src/core/theme-library/presets.js`. To create one, add a new object to the map:

```javascript
'ocean_deep': {
    '--bg-body': '#001a2c',
    '--bg-sidebar': '#00253d',
    '--primary-color': '#0ea5e9',
    '--font-heading': 'Syne',
    '--radius-theme': '20px',
    '--bg-texture': 'dots-subtle'
}
```

## 🪄 Adding New Fonts

1.  Import the font at the top of your `index.css` via Google Fonts or `@font-face`.
2.  Add the definition in `src/core/theme-library/fonts.js`:

```javascript
{ id: 'new-font', name: 'New Font', value: "'New Font', sans-serif", category: 'display' }
```

## 🖼️ Texture Library

Textures are SVG patterns injected into the `body` background. 
- CSS classes are in `core/styles/textures.css`.
- JS definitions are in `core/theme-library/textures.js`.

To add a new one, create the `.texture-name` class in the CSS with the `background-image` (SVG Base64) and register it in `textures.js`.

## 📏 Global Scale (`font-size-factor`)

The system does not use fixed font sizes. It uses a multiplier variable:
`font-size: calc(1rem * var(--font-size-factor))`.

This allows the user to change the readability of the entire system with a single click without breaking the layout.
