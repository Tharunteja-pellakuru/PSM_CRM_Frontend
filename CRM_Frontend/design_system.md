# Parivartan CRM Design System

## 1. Typography System

**Font Family**: `Inter`, system-ui, sans-serif
**Base Font Size**: `15px` (0.9375rem) - Refined for clarity and SaaS professional feel.
**Line Height**: `1.6` (Body), `1.25` (Headings)
**Letter Spacing**: `-0.01em` (Headings), `-0.005em` (Body)

### Scale

| Level | Size (px) | Size (rem) | Weight  | Use Case                  |
| ----- | --------- | ---------- | ------- | ------------------------- |
| H1    | 24px      | 1.5rem     | 700     | Page Titles               |
| H2    | 20px      | 1.25rem    | 600     | Section Headers           |
| H3    | 17px      | 1.0625rem  | 600     | Card Titles               |
| Body  | 15px      | 0.9375rem  | 400/500 | Standard Content          |
| Small | 13px      | 0.8125rem  | 500     | Meta text, Labels         |
| Tiny  | 10px      | 0.625rem   | 600     | Badges,  Headers |

## 2. Spacing System

Base unit: `4px` (0.25rem)

| Variable  | Value | Tailwind | Use Case                            |
| --------- | ----- | -------- | ----------------------------------- |
| --space-1 | 4px   | 1        | Tight gaps, icon padding            |
| --space-2 | 8px   | 2        | Element spacing, small card padding |
| --space-3 | 12px  | 3        | Medium gaps, standard padding       |
| --space-4 | 16px  | 4        | Section gaps, comfortable padding   |
| --space-5 | 20px  | 5        | Component separation                |
| --space-6 | 24px  | 6        | Major layout sections               |

## 3. Component Standards

**Cards**:

- **Primary Container Radius**: `16px` (`rounded-2xl`) - Used for all main dashboard cards, list containers, and modal bodies.
- **Secondary Element Radius**: `12px` (`rounded-xl`) - Used for inner elements like input fields, small stat tiles, and buttons.
- **Small Element Radius**: `8px` (`rounded-lg`) - Used for badges and small UI controls.
- **Padding**:
  - **Standard**: `1.5rem` (24px) - `p-6` for main cards.
  - **Compact**: `1rem` (16px) - `p-4` for secondary cards or sub-sections.
- **Border**: `1px solid #F1F5F9` (slate-100) or `1px solid #E2E8F0` (slate-200).
- **Shadow**: `shadow-sm` (default), `shadow-md` (on hover or for floating elements).
- **Background**: White (`#FFFFFF`) or subtle slate-50 (`#F8FAFC`) for nested areas.

**Buttons**:

- Height: `36px` - `44px`
- Padding: `0.75rem` (12px) horizontal
- Radius: `12px` (rounded-xl)
- Typography: , tracking-widest, bold.

**Iconography**:

- Standard Size: `18px` (1.125rem) approx
- Stroke Width: `2px` or `3px` (bold)
- Color: Muted by default, Primary/Secondary on active/hover.

## 4. Accessibility

- **Contrast**: Text `#1C1C1C` on `#F6F9F4` passes AAA. Muted text `#5F7A61` passes AA.
- **Responsiveness**:
  - Mobile: H1 scales down to 20px.
  - Sidebar: Collapses or hides.
  - Padding: Reduces to `--space-3` or `--space-4` on mobile.
