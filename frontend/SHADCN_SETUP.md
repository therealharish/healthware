# shadcn/ui Integration Guide

## Overview
I've successfully integrated shadcn/ui into your React healthcare application. Here's everything you need to know about using these components.

## What was set up:

### 1. Configuration Files
- ✅ `components.json` - shadcn/ui configuration
- ✅ Updated `tailwind.config.js` with shadcn theme variables
- ✅ Updated `tsconfig.app.json` with path aliases (@/* imports)
- ✅ Updated `vite.config.ts` with path resolution
- ✅ Updated `src/index.css` with CSS variables for theming

### 2. Installed Dependencies
- ✅ `class-variance-authority` - For component variants
- ✅ `clsx` - For conditional classes
- ✅ `tailwind-merge` - For merging Tailwind classes
- ✅ `@types/node` - Node.js types

### 3. Core Components Added
- ✅ Button (`src/components/ui/button.tsx`)
- ✅ Card (`src/components/ui/card.tsx`)
- ✅ Input (`src/components/ui/input.tsx`)
- ✅ Label (`src/components/ui/label.tsx`)
- ✅ Select (`src/components/ui/select.tsx`)
- ✅ Textarea (`src/components/ui/textarea.tsx`)

### 4. Utility Functions
- ✅ `src/lib/utils.ts` - Contains the `cn()` function for merging classes

## How to Use shadcn/ui Components

### Basic Import Pattern
```tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
```

### Button Examples
```tsx
// Basic button
<Button>Click me</Button>

// Button variants
<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>

// Button sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>

// Disabled button
<Button disabled>Disabled</Button>
```

### Card Examples
```tsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description goes here</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Form Elements
```tsx
// Input with Label
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input 
    id="email" 
    type="email" 
    placeholder="Enter your email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
</div>

// Select dropdown
<Select value={selectedValue} onValueChange={setSelectedValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select an option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>

// Textarea
<Textarea 
  placeholder="Enter your message"
  value={message}
  onChange={(e) => setMessage(e.target.value)}
  rows={4}
/>
```

## Adding More Components

To add additional shadcn/ui components, use the CLI:

```bash
# Navigate to frontend directory
cd /Users/harishh/Downloads/Healthware/frontend

# Add specific components
npx shadcn@latest add dialog
npx shadcn@latest add toast
npx shadcn@latest add alert
npx shadcn@latest add badge
npx shadcn@latest add checkbox
npx shadcn@latest add radio-group
npx shadcn@latest add switch
npx shadcn@latest add tabs
npx shadcn@latest add dropdown-menu
npx shadcn@latest add popover
npx shadcn@latest add calendar
npx shadcn@latest add form

# View all available components
npx shadcn@latest add
```

## Example: Updated BookAppointment Component

I've created `BookAppointmentShadcn.tsx` that demonstrates how to replace your existing form elements with shadcn/ui components:

### Key Changes:
1. **Buttons**: Replaced custom styled buttons with `<Button>` component with variants
2. **Cards**: Wrapped sections in `<Card>` components for better structure
3. **Form Elements**: Used `<Input>`, `<Select>`, `<Textarea>`, and `<Label>` components
4. **Theming**: Uses CSS variables for consistent theming

### Benefits:
- ✅ Consistent design system
- ✅ Better accessibility
- ✅ Type-safe components
- ✅ Easy theming and customization
- ✅ Responsive design out of the box

## Theming

The components use CSS variables defined in `src/index.css`. You can customize:

- Primary colors
- Background colors  
- Border colors
- Text colors
- Border radius
- And more...

## Recommendations for Your Healthcare App

For a healthcare application, consider adding these additional components:

```bash
# For appointments and scheduling
npx shadcn@latest add calendar
npx shadcn@latest add dialog

# For notifications and alerts
npx shadcn@latest add toast
npx shadcn@latest add alert

# For forms
npx shadcn@latest add form
npx shadcn@latest add checkbox
npx shadcn@latest add radio-group

# For data display
npx shadcn@latest add table
npx shadcn@latest add badge
npx shadcn@latest add separator

# For navigation
npx shadcn@latest add tabs
npx shadcn@latest add dropdown-menu
```

## Next Steps

1. Replace existing components in your app with shadcn/ui equivalents
2. Add more components as needed using the CLI
3. Customize the theme in `src/index.css` to match your brand
4. Consider adding dark mode support (already configured in the theme)

The setup is complete and ready to use! You can now start using these components throughout your application for a consistent, professional UI.
