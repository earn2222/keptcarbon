# 📱 Responsive Design System - KeptCarbon

A **mobile-first, fully responsive UI framework** built with TailwindCSS. This design system ensures your application looks and works beautifully across all devices: mobile, tablet, and desktop.

## 🎯 Key Features

### ✅ Mobile-First Design
- Designed for mobile devices first, then progressively enhanced for larger screens
- Ensures optimal performance on all devices
- Base styles target mobile, with breakpoints for larger screens

### ✅ Touch-Friendly Interactions
- **48px minimum touch targets** on mobile (following Apple/Android guidelines)
- **44px touch targets** on desktop
- All buttons, inputs, and interactive elements are optimized for finger taps
- No accidental clicks from small touch areas

### ✅ Flexible Grid Layout
- CSS Grid-based responsive system
- **1 column** on mobile
- **2 columns** on tablet
- **3+ columns** on desktop
- Auto-fit grids that adapt based on content

### ✅ Fluid Typography
- Uses CSS `clamp()` for smooth text scaling
- No jarring text size jumps between breakpoints
- Readable on all screen sizes
- Optimized line-height and letter-spacing

### ✅ Comprehensive Breakpoints
```
xs:  475px   - Extra small devices
sm:  640px   - Mobile landscape / Small tablets  
md:  768px   - Tablets
lg:  1024px  - Small laptops / Tablets landscape
xl:  1280px  - Desktops
2xl: 1536px  - Large desktops
```

---

## 🚀 Quick Start

### View the Demo

Visit `/demo` route to see all responsive features in action:
```bash
npm run dev
```
Then navigate to `http://localhost:5173/demo`

---

## 📖 Usage Guide

### 1. Responsive Containers

Use the `.container-responsive` class for auto-responsive containers:

```jsx
<div className="container-responsive">
  {/* Content automatically gets responsive padding and max-width */}
</div>
```

**Behavior:**
- Mobile: Full width with 1rem padding
- Tablet: 640px-768px max-width with 1.5rem padding
- Desktop: Up to 1536px max-width with 2rem padding

---

### 2. Responsive Grids

#### Standard Responsive Grid
```jsx
<div className="grid-responsive">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```
- **Mobile:** 1 column
- **Tablet (≥640px):** 2 columns
- **Desktop (≥1024px):** 3 columns

#### Auto-Fit Grid
```jsx
<div className="grid-auto-fit">
  {/* Items automatically fit based on available space */}
</div>
```
- Automatically calculates optimal number of columns
- Minimum 250px per item on mobile, 300px on tablet+

---

### 3. Touch-Friendly Buttons

#### Primary Button
```jsx
<button className="btn-primary">
  Click Me
</button>
```
- 48px minimum height on mobile
- 44px on desktop
- Gradient background with hover effects

#### Secondary Button
```jsx
<button className="btn-secondary">
  Cancel
</button>
```
- Outlined style
- Same touch-friendly sizing

#### Icon Button
```jsx
<button className="btn-icon">
  <svg>...</svg>
</button>
```
- Perfect square touch target
- Optimized for icon-only interactions

---

### 4. Responsive Cards

```jsx
<div className="card-responsive">
  <h3>Card Title</h3>
  <p>Card content</p>
</div>
```

**Responsive padding & border-radius:**
- Mobile: 16px radius, 1.25rem padding
- Tablet: 20px radius, 1.5rem padding
- Desktop: 24px radius, 2rem padding

---

### 5. Form Inputs

#### Text Input
```jsx
<input type="text" className="input-responsive" placeholder="Enter text" />
```

#### Select Dropdown
```jsx
<select className="select-responsive">
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

**Features:**
- 48px height on mobile for easy tapping
- Custom styled dropdown arrow
- Focus states with green accent
- Smooth transitions

---

### 6. Responsive Spacing

#### Responsive Padding
```jsx
<div className="p-responsive">
  {/* 1rem on mobile → 1.5rem on tablet → 2rem on desktop */}
</div>
```

#### Responsive Gaps
```jsx
<div className="flex gap-responsive">
  {/* Gap increases with screen size */}
</div>
```

---

### 7. Responsive Typography

Use semantic HTML tags with automatic responsive sizing:

```jsx
<h1>Main Heading</h1>      {/* 1.75rem → 3rem */}
<h2>Section Heading</h2>   {/* 1.5rem → 2.25rem */}
<h3>Subsection</h3>        {/* 1.25rem → 1.875rem */}
<p>Body text</p>           {/* 0.875rem → 1rem */}
```

Or use utility classes:
```jsx
<div className="text-h1">Heading 1 Style</div>
<div className="text-body">Body Style</div>
<div className="text-small">Small Text</div>
```

---

### 8. Visibility Utilities

#### Hide on Mobile
```jsx
<div className="hide-mobile">
  {/* Hidden on screens < 640px */}
</div>
```

#### Show Only on Mobile
```jsx
<div className="show-mobile-only">
  {/* Visible only on screens < 640px */}
</div>
```

#### Hide on Tablet
```jsx
<div className="hide-tablet">
  {/* Hidden on screens 640px - 1024px */}
</div>
```

#### Hide on Desktop
```jsx
<div className="hide-desktop">
  {/* Hidden on screens ≥ 1024px */}
</div>
```

---

### 9. Gradient Utilities

```jsx
<div className="gradient-primary">Primary Gradient</div>
<div className="gradient-secondary">Secondary Gradient</div>
<div className="gradient-success">Green Success Gradient</div>
<div className="gradient-warm">Orange/Yellow Gradient</div>
<div className="gradient-cool">Blue Gradient</div>
```

---

### 10. Shadow System

```jsx
<div className="shadow-card">Subtle card shadow</div>
<div className="shadow-premium">Premium shadow</div>
<div className="shadow-hover">Hover state shadow</div>
```

---

### 11. Safe Area Support (iOS)

For iOS devices with notches and home indicators:

```jsx
<div className="safe-top">
  {/* Padding respects iOS notch */}
</div>

<footer className="safe-bottom">
  {/* Padding respects iOS home indicator */}
</footer>
```

---

### 12. Animations

```jsx
<div className="animate-fadeIn">Fade in on load</div>
<div className="animate-fadeInUp">Fade in from bottom</div>
<div className="animate-scaleIn">Scale in on load</div>
<div className="animate-slideInRight">Slide from right</div>
<div className="animate-slideInLeft">Slide from left</div>
```

#### Animation Delays
```jsx
<div className="animate-fadeIn delay-1">First</div>
<div className="animate-fadeIn delay-2">Second</div>
<div className="animate-fadeIn delay-3">Third</div>
```

---

## 🎨 Tailwind Breakpoint Classes

You can use Tailwind's responsive modifiers with any utility:

```jsx
<div className="flex flex-col sm:flex-row md:gap-6 lg:gap-8">
  {/* Flex direction changes at 640px, gap increases at 768px and 1024px */}
</div>

<h1 className="text-2xl md:text-4xl lg:text-5xl">
  {/* Text size increases with screen size */}
</h1>

<div className="w-full md:w-1/2 lg:w-1/3">
  {/* Width: 100% → 50% → 33% */}
</div>
```

---

## 📐 Design Guidelines

### Touch Targets
- **Minimum:** 48px × 48px on mobile
- **Recommended:** 56px × 56px for primary actions
- **Desktop:** Can reduce to 44px × 44px minimum

### Typography Scale
- Use fluid typography (clamp) for smooth scaling
- Line-height: 1.5-1.6 for body text
- Line-height: 1.2-1.4 for headings

### Spacing
- Use multiples of 4px or 8px for consistency
- Increase spacing proportionally with screen size

### Grid Layouts
- Start with 1 column on mobile
- Add columns at breakpoints as content allows
- Use gap utilities for consistent spacing

---

## 🔧 Customization

All responsive values can be customized in `tailwind.config.js`:

```javascript
// Example: Add a new breakpoint
screens: {
  'xs': '475px',
  'custom': '900px',  // Add custom breakpoint
  // ...
}

// Example: Customize touch targets
minHeight: {
  'touch-custom': '52px',
}
```

---

## ♿ Accessibility

### Reduced Motion
The system respects `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  /* All animations are disabled */
}
```

### Screen Readers
- Semantic HTML is used throughout
- Focus states are clearly visible
- Touch targets meet WCAG guidelines

---

## 📱 Testing Responsive Design

### Browser DevTools
1. Open Chrome/Firefox DevTools (F12)
2. Click device toolbar icon (Ctrl+Shift+M)
3. Select different device presets:
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - iPad (768px)
   - iPad Pro (1024px)

### Breakpoint Indicator
Visit `/demo` to see a live breakpoint indicator that shows current screen size category.

---

## 🎯 Best Practices

1. **Always Start Mobile-First**
   ```jsx
   {/* ✅ Good */}
   <div className="flex-col md:flex-row">
   
   {/* ❌ Avoid */}
   <div className="flex-row md:flex-col">
   ```

2. **Use Responsive Utilities First**
   ```jsx
   {/* ✅ Good - Use built-in classes */}
   <div className="p-responsive">
   
   {/* ❌ Avoid - Custom breakpoints when not needed */}
   <div className="p-4 sm:p-6 md:p-8">
   ```

3. **Test on Real Devices**
   - Simulators are helpful but not perfect
   - Test touch interactions on actual phones/tablets
   - Check iOS Safari and Chrome on Android

4. **Optimize Images**
   ```jsx
   {/* Use responsive images */}
   <picture>
     <source media="(min-width: 1024px)" srcSet="large.jpg" />
     <source media="(min-width: 640px)" srcSet="medium.jpg" />
     <img src="small.jpg" alt="Description" />
   </picture>
   ```

---

## 📚 Examples

Check `src/pages/ResponsiveDemo.jsx` for comprehensive examples of all features.

---

## 🐛 Common Issues

### Issue: Text too small on mobile
**Solution:** Use `text-base` or larger, not `text-sm` for body text

### Issue: Buttons too small to tap
**Solution:** Use `btn-primary` / `btn-secondary` classes or ensure `min-h-touch`

### Issue: Layout breaks on tablet
**Solution:** Test at 768px breakpoint specifically, add `md:` utilities

### Issue: Horizontal scroll on mobile  
**Solution:** Add `overflow-x: hidden` to container or check for fixed widths

---

## 🤝 Contributing

When adding new components:
1. Start with mobile design first
2. Use utility classes from this system
3. Ensure 48px minimum touch targets
4. Test across breakpoints
5. Document responsive behavior

---

## 📄 License

This responsive design system is part of the KeptCarbon project.

---

**Built with ❤️ using Mobile-First Responsive Design**  
TailwindCSS • React • Fluid Typography • Touch-Optimized
