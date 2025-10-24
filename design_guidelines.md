# Payroll Management System - Design Guidelines

## Design Framework
**Material Design + Ant Design** for enterprise data management  
**Principles**: Data clarity first, workflow efficiency, professional trust, responsive tables

---

## Typography

### Font Families
- **Primary**: Inter (Google Fonts) - UI text
- **Monospace**: JetBrains Mono - numbers, IDs, account codes

### Scale
```
Page Titles:     text-3xl font-semibold (36px)
Section Headers: text-xl font-semibold (20px)
Card Titles:     text-lg font-medium (18px)
Body:            text-base (16px)
Table Headers:   text-sm font-semibold uppercase tracking-wide
Table Data:      text-sm (14px, monospace for numbers)
Labels:          text-sm font-medium
Helper Text:     text-xs (12px)
```

---

## Layout & Spacing

### Spacing Scale
`2, 4, 6, 8, 12, 16` (Tailwind units)
- Micro: `gap-2` (8px)
- Component padding: `p-4` to `p-6`
- Section: `space-y-8` (32px)
- Page: `p-6` to `p-8`

### Grids
- **Dashboard**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
- **Forms**: `grid-cols-1 lg:grid-cols-2`
- **Containers**: `max-w-7xl` (main), `max-w-2xl` (forms)

---

## Color System

### Backgrounds
- **Primary**: Blue-600 (actions)
- **Success**: Green-600
- **Danger**: Red-600
- **Surface**: White/Gray-50
- **Border**: Gray-300

### States
- **Hover**: Gray-100 (rows), shadow-md (cards)
- **Focus**: `ring-2 ring-offset-0` (primary color)
- **Error**: Red-50 bg + Red-600 border/text
- **Disabled**: Gray-300

---

## Components

### Navigation
**Top Bar** (64px fixed)
- Logo left, user menu right
- Nav links centered/left after logo
- Logout: `arrow-right-on-rectangle` icon

**Sidebar** (alternative)
- Desktop: `w-64`, collapsible to `w-16`
- Active: 4px left border indicator
- Icons + text labels

### Dashboard Tiles
```html
<div class="rounded-lg shadow-sm border min-h-32 p-6 hover:shadow-md cursor-pointer">
  <icon class="h-12 w-12" /> <!-- 48px Heroicons -->
  <h3 class="text-3xl font-bold mt-4">{metric}</h3>
  <p class="text-sm text-gray-600">{label}</p>
  <span class="text-xs">{trend with arrow icon}</span>
</div>
```

### Data Tables
```html
<table class="w-full">
  <thead class="sticky top-0 z-10 bg-white">
    <th class="px-6 py-4 text-left text-sm font-semibold uppercase">
      Name <icon>chevron-up-down</icon>
    </th>
  </thead>
  <tbody>
    <tr class="odd:bg-gray-50 hover:bg-gray-100 border-b">
      <td class="px-6 py-4 text-sm">{data}</td>
      <td class="px-6 py-4 text-sm text-right font-mono">{number}</td>
      <td class="px-6 py-4 text-right">
        <button class="h-10 w-10 rounded-md"><icon>pencil</icon></button>
        <button class="h-10 w-10 rounded-md"><icon>trash</icon></button>
      </td>
    </tr>
  </tbody>
</table>
```

**Pagination**: "Showing 1-20 of 150" + Previous/Next controls

### Forms
**Input Fields** (`h-10`)
```html
<label class="text-sm font-medium mb-2">
  Field Name <span class="text-red-500">*</span>
</label>
<input class="h-10 px-4 py-2 border rounded-md focus:ring-2" />
<p class="text-xs text-gray-600 mt-1">Helper text</p>
```

**Select/Date**: Same `h-10`, icons right-aligned  
**File Upload**: Dashed border, `min-h-48`, drag-drop zone, `arrow-up-tray` icon

### Buttons
```
Primary:   h-10 px-6 font-medium rounded-md
Secondary: h-10 px-6 font-medium rounded-md border-2
Danger:    h-10 px-6 font-medium rounded-md bg-red-600
Icon:      h-10 w-10 rounded-md
```

### Cards
```html
<div class="border rounded-lg shadow-sm p-6">
  <header class="flex justify-between items-center mb-4">
    <h3 class="text-lg font-medium">{title}</h3>
    <button>{action}</button>
  </header>
  <div class="space-y-4">{content}</div>
</div>
```

### Modals
- **Standard**: `max-w-2xl` centered, backdrop overlay
- **Confirmation**: `max-w-md`, warning icon for destructive
- **Header**: Title left, `x-mark` icon right
- **Content**: `max-h-96 overflow-y-auto`
- **Footer**: Buttons right-aligned

### Notifications (Toast)
- Position: `top-4 right-4`
- Auto-dismiss: 5s
- Icons: `check-circle` (success), `x-circle` (error), `exclamation-circle` (warning)

### Charts
- Library: Chart.js or Recharts
- Min height: `h-64` (256px)
- Tooltips on hover, legend top-right
- Consistent color scheme

### Loading States
- Skeleton: `animate-pulse` gray rectangles
- Spinner: Rotating `arrow-path` icon
- Progress: `h-2 rounded-full` bar

---

## Screen-Specific Patterns

### Login
`max-w-md mx-auto mt-32` card: logo → username → password → checkbox → full-width button

### HR Dashboard
1. **4-tile grid**: Upload Attendance, Manage Employees, Generate Salary, View Reports
2. **Charts**: 2-column grid (Project Manpower bar chart, Salary Trends line)
3. **Optional sidebar**: Recent activity feed

### Attendance Upload
1. Month selector dropdown
2. File upload button → Preview table
3. **Validation**: Red rows for errors, summary panel ("25 valid, 3 errors")
4. Action bar: Cancel + Confirm

### Salary Generation
- **Editable table**: Sticky headers + first column
- Auto-calculated cells: read-only gray background
- Editable cells: white with hover edit icon
- Inline: Comments textarea, Add allowance/deduction
- **Footer**: Save All (secondary), Approve & Generate (primary)

### Employee Management
- **List**: Search + filters (Category/Project/Designation), Add button
- **Form**: 2-column modal/page with sections (Personal, Employment, Salary, Bank)
- Food allowance: Radio + conditional input

### Reports
Month range selector → Export format (Excel/CSV) → Column checkboxes → Download

---

## Accessibility (WCAG AA)
- Labels + ARIA on all inputs
- Keyboard navigation (tables, modals)
- `focus:ring-2` visible states
- Error: Red border + icon + descriptive text
- Min touch target: 44x44px
- Contrast ratio compliance

---

## Icons & Animation

### Heroicons (CDN)
- **20px**: Inline UI
- **24px**: Prominent actions
- **48px**: Dashboard tiles
- **Style**: Outline (default), Solid (active states)

### Animations (minimal)
```
Modal:       transition-opacity duration-200
Drawer:      transition-transform duration-300
Button:      hover:scale-105 transition-transform
Table hover: Instant (no transition)
```

---

## Key Implementation Rules

**DO**:
- Right-align numerical columns
- Use monospace for all numbers/IDs
- Zebra stripe tables (`odd:bg-gray-50`)
- Require confirmation for destructive actions
- Show validation errors inline + summary
- Provide loading states for async operations

**DON'T**:
- Mix font families outside Inter/JetBrains Mono
- Use decorative animations
- Create touch targets < 44px
- Skip focus states
- Auto-submit forms without confirmation

---

**Token Budget**: ~1,950 tokens | All critical specs, patterns, code examples, and accessibility rules preserved.