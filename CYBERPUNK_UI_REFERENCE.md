# 🎨 Cyberpunk UI - Visual Reference Card

## Color Palette Quick Reference

```
PRIMARY     #ff006e  ███████ Neon Pink - Main elements, borders
SECONDARY   #00d9ff  ███████ Neon Cyan - Accents, hover states  
ACCENT      #ffde00  ███████ Neon Yellow - Warnings
DARK BG     #0a0e27  ███████ Deep Dark - Background
CARD BG     #1a1a3e  ███████ Dark Secondary - Cards
TEXT        #ffffff  ███████ White - Primary text
TEXT SEC    #b0b0c0  ███████ Gray - Secondary text
```

---

## Quick CSS Variables

```css
/* Colors */
var(--primary-color)        #ff006e
var(--secondary-color)      #00d9ff
var(--accent-color)         #ffde00
var(--dark-bg)              #0a0e27
var(--dark-bg-secondary)    #1a1a3e
var(--text-primary)         #ffffff
var(--text-secondary)       #b0b0c0
var(--border-color)         #ff006e

/* Spacing */
var(--spacing-xs)           0.5rem
var(--spacing-sm)           1rem
var(--spacing-md)           1.5rem
var(--spacing-lg)           2rem
var(--spacing-xl)           3rem

/* Radii */
var(--radius-sm)            0.375rem
var(--radius-md)            0.5rem
var(--radius-lg)            1rem

/* Transitions */
var(--transition)           all 0.3s ease
```

---

## Element Styling Cheat Sheet

### Buttons
```html
<!-- Primary Button -->
<button class="btn btn-primary">Click Me</button>
<!-- Looks: Pink fill → Transparent pink on hover -->

<!-- Secondary Button -->
<button class="btn btn-secondary">Click Me</button>
<!-- Looks: Transparent cyan → Cyan fill on hover -->
```

### Cards
```html
<!-- Styled Card -->
<div style="
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 0 20px rgba(255, 0, 110, 0.15);
">
  Content
</div>
```

### Section Headers
```html
<!-- Styled Header -->
<div class="section-header">
  <h2>Section Title</h2>
  <p>Subtitle with divider</p>
</div>
```

### Messages
```html
<!-- Error Message -->
<div class="error-message">❌ Error text</div>

<!-- Success Message -->
<div class="success-message">✅ Success text</div>

<!-- Warning Message -->
<div class="warning-message">⚠️ Warning text</div>
```

### Input Fields
```html
<!-- Styled Input -->
<textarea 
  class="prompt-input"
  placeholder="Type here..."
></textarea>
```

---

## JavaScript Functions Quick Reference

### Show Notifications
```javascript
showErrorNotification('Error message', 5000)
showSuccessNotification('Success message', 5000)
showWarningNotification('Warning message', 5000)
```

### Add Glow Effects
```javascript
addGlowEffect(element, 'primary', 20)
addPulsingGlow(element, 'primary')
removePulsingGlow(element)
```

### Add Hover Effects
```javascript
addHoverGlowEffect(element, 'primary', 'secondary')
addTextGlow(element, 'primary', 10)
addLetterSpacing(element, 2)
```

### Create Components
```javascript
card = createGlowingCard(htmlContent, 'primary')
menu = createRadialMenu([{label: 'Item', action: fn}])
```

### Utilities
```javascript
color = getCSSVariable('--primary-color')
setCSSVariable('--primary-color', '#newfolor')
```

---

## Hover Effects Overview

```
Element              Default State        Hover State
─────────────────────────────────────────────────────
btn-primary          Pink filled          Transparent + pink glow
btn-secondary        Cyan bordered        Cyan filled + glow
Card                 Pink border          Cyan border + glow
Metric Card          Pink border          Cyan border + glow
Input                Pink border          Cyan border + glow
Menu Item            Pink border          Cyan border + scale
```

---

## Common CSS Patterns

### Glowing Text
```css
color: var(--primary-color);
text-shadow: 0 0 10px rgba(255, 0, 110, 0.3);
```

### Glowing Border
```css
border: 2px solid var(--border-color);
box-shadow: 0 0 20px rgba(255, 0, 110, 0.2);
```

### Hover Glow
```css
transition: all 0.3s ease;
box-shadow: 0 0 30px rgba(255, 0, 110, 0.3);
border-color: var(--secondary-color);
```

### Dark Card
```css
background: var(--card-bg);
border: 2px solid var(--border-color);
box-shadow: 0 0 20px rgba(255, 0, 110, 0.15);
```

---

## Typography

```
Primary Heading
├─ Color: var(--primary-color)
├─ Text-shadow: 0 0 20px glow
├─ Letter-spacing: 2px
└─ Text-transform: uppercase

Secondary Heading
├─ Color: var(--text-primary)
├─ Text-shadow: 0 0 10px glow (subtle)
├─ Letter-spacing: 1px
└─ Font-size: smaller

Body Text
├─ Color: var(--text-primary)
└─ Line-height: 1.6

Secondary Text
├─ Color: var(--text-secondary)
└─ Opacity: 0.8-0.9
```

---

## Animation Classes

```css
/* Pulsing Glow */
@keyframes glow-pulse {
    0%, 100% { box-shadow: 0 0 20px rgba(..., 0.2); }
    50% { box-shadow: 0 0 40px rgba(..., 0.4); }
}

/* Scale Hover */
transition: transform 0.3s ease;
:hover { transform: scale(1.05); }

/* Translate Hover */
transition: transform 0.3s ease;
:hover { transform: translateY(-2px); }
```

---

## Responsive Breakpoints

```
Desktop:    Default styling
Tablet:     @media (max-width: 768px)
Mobile:     @media (max-width: 480px)
```

---

## Accessibility Tips

- Maintain 4.5:1 contrast ratio for text
- Use `text-shadow` carefully for readability
- Ensure glow effects don't obscure content
- Test on different displays/brightness levels
- Use semantic HTML elements

---

## Browser Support

```
Chrome:     ✓ Full support
Firefox:    ✓ Full support
Safari:     ✓ Full support
Edge:       ✓ Full support
IE11:       ~ Partial (no CSS vars, gradients)
```

---

## Performance Tips

1. Use CSS variables instead of hardcoding colors
2. Combine similar selectors
3. Use `transform` instead of `left/top` for animations
4. Minimize box-shadow effects on low-end devices
5. Throttle hover effects if needed

---

## Common Customizations

### Change Primary Color
```css
--primary-color: #your-color;
--border-color: #your-color;
```

### Change Secondary Color
```css
--secondary-color: #your-color;
```

### Reduce Glow Intensity
```css
/* From: 0 0 20px rgba(255, 0, 110, 0.2) */
/* To:   0 0 10px rgba(255, 0, 110, 0.1) */
```

### Increase Glow Intensity
```css
/* From: 0 0 20px rgba(255, 0, 110, 0.2) */
/* To:   0 0 40px rgba(255, 0, 110, 0.4) */
```

---

## File Structure

```
styles.css              ← Main styling
cyberpunk-ui-utils.js   ← Utility functions
index.html              ← Your app
cyberpunk-ui-showcase.html  ← Component demo
```

---

## Quick Links

- 📖 Full Guide: `CYBERPUNK_UI_GUIDE.md`
- 📋 Summary: `CYBERPUNK_UI_SUMMARY.md`
- 🚀 Quick Start: `QUICKSTART_CYBERPUNK.md`
- 🎨 Showcase: `cyberpunk-ui-showcase.html`

---

**Print this card for quick reference! 🎨✨**
