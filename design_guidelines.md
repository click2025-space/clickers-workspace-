# Clickers Workspace Design Guidelines

## Design Approach
**Selected System:** Hybrid approach drawing from Linear's modern minimalism + Notion's clean information architecture + Asana's task management patterns, customized with Clickers' purple-blue brand identity.

**Core Principles:**
- Professional productivity-focused interface
- Information clarity over decoration
- Efficient use of screen space
- Team-centric visual hierarchy

---

## Color Palette

### Dark Mode (Primary)
**Background Colors:**
- Primary Background: `222 25% 12%` (deep charcoal)
- Card Background: `222 20% 16%` (elevated surface)
- Hover State: `222 18% 20%` (subtle lift)
- Border/Divider: `222 15% 25%` (subtle separation)

**Brand Colors:**
- Primary Purple: `270 70% 60%` (Clickers primary)
- Secondary Blue: `220 75% 55%` (accent actions)
- Purple Gradient Start: `270 70% 60%`
- Purple Gradient End: `220 75% 55%`

**Functional Colors:**
- Success: `142 76% 45%` (task completion)
- Warning: `38 92% 50%` (due dates)
- Error: `0 84% 60%` (alerts)
- Text Primary: `0 0% 95%` (headings, important)
- Text Secondary: `0 0% 70%` (descriptions, metadata)
- Text Tertiary: `0 0% 50%` (placeholders, hints)

### Light Mode (Secondary)
- Background: `0 0% 98%`
- Card: `0 0% 100%`
- Text Primary: `222 25% 12%`
- Maintain same brand purple/blue with adjusted saturation

---

## Typography

**Font Family:**
- Primary: `Inter` via Google Fonts (headings, UI)
- Secondary: `IBM Plex Sans` (body text, technical content)

**Type Scale:**
- Hero/Page Title: `text-3xl font-bold` (30px, 700 weight)
- Section Header: `text-2xl font-semibold` (24px, 600)
- Card Title: `text-lg font-medium` (18px, 500)
- Body Text: `text-base` (16px, 400)
- Small/Meta: `text-sm` (14px, 400)
- Tiny/Labels: `text-xs` (12px, 500)

**Line Heights:**
- Headings: `leading-tight` (1.25)
- Body: `leading-relaxed` (1.625)

---

## Layout System

**Spacing Primitives:** Use Tailwind units of `2, 4, 6, 8, 12, 16` consistently
- Component padding: `p-4` to `p-6`
- Section spacing: `py-8` to `py-12`
- Card gaps: `gap-4` to `gap-6`
- Page margins: `px-6` to `px-8`

**Grid System:**
- Container: `max-w-7xl mx-auto px-6`
- Sidebar Width: `w-64` (256px fixed)
- Main Content: `flex-1` (remaining space)
- Card Grids: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`

**Layout Structure:**
```
├── Fixed Sidebar (left, w-64, dark)
├── Main Content Area (flex-1)
│   ├── Header Bar (sticky top, h-16)
│   └── Page Content (p-6 to p-8)
```

---

## Component Library

### Navigation
**Sidebar:**
- Dark background with logo at top
- Navigation items with icons (Heroicons)
- Active state: purple gradient background + white text
- Hover: subtle background lift
- Dividers between logical sections

**Header Bar:**
- Height: `h-16`, sticky positioning
- Search bar: rounded pill shape with icon
- Notification bell with badge indicator
- User avatar dropdown (top-right)

### Cards
**Project/Department Cards:**
- Rounded: `rounded-xl`
- Shadow: `shadow-lg hover:shadow-xl transition-shadow`
- Padding: `p-6`
- Border: subtle `border border-gray-800`
- Hover: slight scale `hover:scale-[1.02]`

**Task Cards (Kanban):**
- Compact: `p-4 rounded-lg`
- Drag indicator: subtle grip icon
- Color-coded labels with badge styling
- Avatar thumbnails for assignments

### Buttons & CTAs
**Primary Button:**
- Purple gradient background
- Rounded: `rounded-lg`
- Padding: `px-6 py-2.5`
- Font: `font-medium text-sm`
- Shadow on hover

**Secondary Button:**
- Transparent with purple border
- Same sizing as primary
- Hover: purple background with opacity

### Data Visualization
**Progress Bars:**
- Height: `h-2 rounded-full`
- Background: dark gray track
- Fill: purple-to-blue gradient
- Percentage label above or inline

**Status Badges:**
- Pill-shaped: `rounded-full px-3 py-1 text-xs`
- Color-coded: green (done), blue (in progress), gray (todo)

### Forms & Inputs
**Input Fields:**
- Dark background: `bg-gray-800`
- Border: `border border-gray-700`
- Rounded: `rounded-lg`
- Focus: purple ring
- Padding: `px-4 py-2.5`

**Dropdowns & Selects:**
- Match input styling
- Custom arrow icon
- Dropdown menu: elevated card style

### Chat Interface
**Message Bubbles:**
- Sent: purple gradient, right-aligned
- Received: dark gray, left-aligned
- Rounded: `rounded-2xl` with tail effect
- Padding: `px-4 py-2`
- Timestamp: small text below

### Profile Cards
**Member Cards:**
- Avatar: `w-16 h-16 rounded-full` with border
- Name: `font-semibold`
- Role: `text-sm text-gray-400`
- Department badge below
- Hover: subtle glow effect

---

## Animations
**Minimal Approach:** Only use for state feedback
- Card hover: `transition-transform duration-200`
- Button press: subtle scale
- Page transitions: none (instant)
- Task drag: native browser behavior

---

## Icons
**Library:** Heroicons (outline for navigation, solid for badges/status)
**Usage:**
- Sidebar navigation icons: 20px
- Header icons: 24px
- Card icons: 16px
- Status indicators: 14px

---

## Images

### Dashboard Hero (Optional)
If including a hero section on Dashboard:
- Abstract geometric workspace illustration
- Purple-blue gradient overlay
- Positioned at top, `h-48` to `h-64`
- Welcome message overlaid

### Team Member Photos
- Circular avatars throughout
- Placeholder: gradient circles with initials
- Sizes: 32px (small), 40px (medium), 64px (large)

### Department Icons
- Custom illustrated icons for each department
- Consistent style: line art with purple accent
- Size: 48px to 64px on cards

---

## Page-Specific Guidelines

**Dashboard:** 3-column grid of project cards, stats bar at top, recent activity feed

**Virtual Offices:** 2-column department cards grid, click expands to detailed view with team roster and task summary

**Tasks Board:** 3-column Kanban (fixed columns), cards draggable, add task button per column

**Team Chat:** Sidebar 280px, main chat area with date dividers, input bar fixed bottom

**Members:** 4-column grid on desktop, filter/search bar at top, add member button prominent

**Settings:** Single column form layout, toggle switches for theme, input fields for customization

---

## Responsive Behavior
- Desktop: Full sidebar + content
- Tablet (md): Collapsible sidebar to icon-only
- Mobile: Hidden sidebar, hamburger menu