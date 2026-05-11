---
name: PrepVicta Design System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#006a61'
  on-secondary: '#ffffff'
  secondary-container: '#86f2e4'
  on-secondary-container: '#006f66'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#2a1700'
  on-tertiary-container: '#b87500'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#89f5e7'
  secondary-fixed-dim: '#6bd8cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Lexend
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Lexend
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.25'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Lexend
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style

The brand personality is **Authoritative yet Vital**. It bridges the gap between a parent's need for institutional credibility and a student's need for an energetic, modern learning environment. The design system uses a **Corporate / Modern** style as its foundation to establish trust, while integrating elements of **Minimalism** to reduce cognitive load during intense study sessions.

To appeal to both demographics, the UI employs high-quality whitespace and structured information architecture. For students, subtle motivational cues are integrated through vibrant accent colors and progress-driven micro-interactions. For parents, the aesthetic remains grounded and "premium," signaling a high-quality educational investment.

## Colors

The palette is anchored by **Deep Navy (Primary)**, representing the stability and academic rigor expected of a medical entrance platform. This is contrasted by **Vibrant Teal (Secondary)**, which provides a refreshing, medical-adjacent energy that feels modern and motivating. **Amber (Tertiary)** is used sparingly for high-urgency alerts, "Streak" indicators, and limited-time offers to drive action.

The neutral scale favors cool grays to maintain a clean, clinical, and professional atmosphere. Success, error, and warning states follow standard conventions but are adjusted for high accessibility to ensure clarity for all age groups.

## Typography

This design system utilizes **Lexend** for headlines. Its specific design intended for reading proficiency makes it the ideal choice for an EdTech platform where information absorption is the priority. It feels friendly to the student while remaining structured for the parent.

**Inter** is used for all body copy and UI labels. Its neutral, systematic nature ensures that complex test questions and data-heavy reports remain legible across all device sizes. High contrast ratios and generous line-heights are enforced to prevent eye strain during long-form reading.

## Layout & Spacing

The layout follows a **12-column fixed grid** for desktop, transitioning to a fluid single-column layout for mobile. A strict 8px base unit (the "rhythm") governs all spatial relationships. 

To create a sense of focus, the content is centered within a maximum-width container, preventing "eye-travel" fatigue. Large margins and significant vertical padding between sections are used to separate different study modules, making the platform feel less cluttered and more manageable for the student.

## Elevation & Depth

Visual hierarchy is established through **Tonal Layers** and **Ambient Shadows**. The background uses a very light gray (#F8FAFC) to allow white cards to "pop" without harsh shadows.

Shadows are used purposefully:
1.  **Level 0 (Flat):** Used for non-interactive backgrounds and containers.
2.  **Level 1 (Subtle):** A low-opacity, diffused shadow (10% opacity) for standard lesson cards and progress trackers.
3.  **Level 2 (Active):** Higher diffusion (15% opacity) used for hover states and modals to indicate interactivity or priority.

For **Locked Content**, a "frosted glass" (Glassmorphism) overlay is applied. This keeps the content visible enough to pique interest but clearly inaccessible, paired with a centered "Secondary Color" padlock icon.

## Shapes

The design system utilizes a **Rounded** shape language (8px / 0.5rem base radius). This strikes a balance between the soft, approachable nature of modern mobile apps and the professional structure of a web-based educational portal.

- **Standard Buttons & Inputs:** 8px radius.
- **Content Cards:** 16px (rounded-lg) to create a soft frame for learning material.
- **Onboarding Elements:** 24px (rounded-xl) to feel more inviting and less "test-like."
- **Progress Bars:** Fully pill-shaped (rounded-full) to symbolize fluidity and forward momentum.

## Components

### Buttons
- **Primary:** Deep Navy background with white text. High-weight (bold) to signal the main path (e.g., "Start Test").
- **Secondary:** Vibrant Teal background or border. Used for supportive actions (e.g., "View Solution").
- **Ghost:** No background, Primary color text. Used for secondary navigation or "Back" actions.

### Secure Forms
Inputs feature a distinct 2px border on focus using the **Primary Deep Blue**. Error states use a high-contrast red with a supporting icon to ensure clarity for parents who may be less tech-savvy. Success states (e.g., payment confirmation) use a "Teal" checkmark for positive reinforcement.

### Status Indicators
- **Locked Content:** A semi-transparent overlay with a "Teal" padlock and a "Premium" badge in the top right.
- **Progress Tracking:** Linear pill-shaped bars. The "fill" color is Teal to represent health and progress.
- **NEET Rank Predictor:** Uses high-elevation cards with the **Secondary Color** as a glow effect to highlight "Success Path" metrics.

### Onboarding Elements
Onboarding steps utilize large-scale typography and illustrative icons. Each step includes a "Parental Control" toggle or indicator when relevant, using a distinct icon to reassure the older demographic of the platform's security.