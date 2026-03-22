# River City Handyman - Brand Design Guidelines

## Design Direction: "Honest Craftsmanship"
Premium handyman brand that feels trustworthy, established, and professional.
Think: **Architectural precision meets artisan quality.**

---

## Color Palette

### Primary Colors
- **Deep Navy** `#1a2332` - Trust, professionalism, stability
  - Used for: Headers, navigation, main headings, footer
- **Burnt Sienna** `#c8553d` - Warmth, action, energy
  - Used for: Primary CTAs, tool icons, active states

### Secondary Colors
- **Copper** `#cf7a4d` - Highlights and accents
  - Used for: Secondary CTAs, badges, icon accents
- **Warm Stone** `#f5f1e8` - Premium background
  - Used for: Page body background
- **Pure White** `#ffffff` - Clean surfaces
  - Used for: Cards, pricing tables, form backgrounds

### Text Colors
- **Charcoal** `#3a3f47` - Primary text
- **Medium Gray** `#6b7280` - Secondary/body text
- **Warm White** `#fafaf9` - Inverse text (on dark backgrounds)

---

## Typography

### Fonts  
- **Heading Font**: Sora (Geometric, modern, professional)
  - Weights: 400, 500, 600, 700, 800
- **Body Font**: Source Sans Pro (Friendly, readable, professional)
  - Weights: 400, 600, 700

### Font Usage
```css
h1: 800 weight, 2.75-4.5rem (clamp)
h2: 700 weight, 2.25-3.5rem (clamp)
h3: 600 weight, 1.75-2.5rem (clamp)
h4: 600 weight, 1.35-1.75rem (clamp)
body: 400 weight, 1.125rem, line-height 1.7
```

---

## Button Styles

### Primary Button (CTA)
- Background: Burnt Sienna to Copper gradient
- Color: White
- Padding: 1.1rem 2.25rem
- Border radius: 12px (--radius-md)
- Shadow: Accent shadow (rgba(200, 85, 61, 0.25))
- Hover: Lift 3px, increase shadow

### Secondary Button
- Background: White
- Border: 2px solid Deep Navy
- Color: Deep Navy
- Hover: Inverted (Navy background, white text)

---

## Services

### Core Services (for homepage)
1. **General Repairs** - Door hinges, squeaky floors, broken fixtures
2. **Carpentry & Joinery** - Custom shelving, decks, cabinets
3. **Home Maintenance** - Gutter cleaning, pressure washing, assembly
4. **Plumbing Basics** - Leaky faucets, toilet repairs, pipe insulation
5. **Painting & Finishing** - Interior/exterior, drywall, plastering
6. **Property Improvements** - Fences, retaining walls, outdoor structures

---

## Key Messaging

### Tagline
**"Quality Craftsmanship. Honest Service."**

### Hero Messaging
- **Badge**: Brisbane's Trusted Handyman
- **H1**: Quality Craftsmanship. Honest Service.
- **Subtitle**: Professional home repairs, maintenance, and renovations across Brisbane. Licensed, insured, and committed to excellence in every job—big or small.
- **Trust Line**: Licensed & Insured • Same-Day Service Available • 100% Satisfaction Guaranteed

### Why Choose Us (3 pillars)
1. **Licensed & Insured** - Fully licensed, insured, compliant with Australian standards
2. **Prompt & Reliable** - On time, every time. Same-day service available
3. **Quality Guaranteed** - 100% satisfaction guarantee on all work

---

## Visual Style

### Design Principles
- Clean lines and generous whitespace
- Subtle tool motifs (wrenches, hammers in SVG icons)
- Precision-focused imagery
- Professional photography (if available) showing craftsman ship details
- Card-based layouts with soft shadows

### Shadows
```css
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.08)
--shadow-md: 0 4px 8px -2px rgba(0, 0, 0, 0.12)
--shadow-lg: 0 12px 24px -4px rgba(0, 0, 0, 0.16)
--shadow-accent: 0 8px 24px rgba(200, 85, 61, 0.25)
```

### Border Radius
```css
--radius-sm: 6px
--radius-md: 12px
--radius-lg: 18px
--radius-xl: 24px
```

---

## Animations

### Keyframes
- **fadeUp**: Gentle upward fade-in
- **blurIn**: Blur-to-focus entrance
- **toolSlide**: Subtle slide with rotation (for icons)
- **pulseGlow**: Accent color glow effect

### Transition Timing
- **ease-smooth**: cubic-bezier(0.4, 0, 0.2, 1)
- **ease-out**: cubic-bezier(0.165, 0.84, 0.44, 1)

---

## Contact Information

### Phone
- Display: (02) 8958 8545 *(placeholder - update with real number)*
- Link: tel:+61289588545

### Service Area
- Brisbane and surrounding suburbs

### Business Hours
- Monday-Friday: 7:00 AM - 5:00 PM
- Saturday: 8:00 AM - 2:00 PM
- Sunday: Emergency service only

---

## AI Chatbot Configuration

The website includes an AI chatbot that should be configured to:
- Greet visitors as River City Handyman
- Answer questions about services, pricing, availability
- Qualify leads by asking about job type, urgency, location
- Schedule callbacks through the admin dashboard
- Download chat transcripts via email

**Chatbot Personality**: Friendly, professional Brisbane tradie. Knowledgeable but not overly technical. Focuses on solutions and reliability.

---

## Technical Notes

### Functionality to Preserve
✅ AI chat widget (bottom-right, all pages)
✅ Admin dashboard (/admin/callbacks.html)
✅ Contact forms with dual email (customer + admin)
✅ Email transcript download from chat
✅ PostgreSQL lead database
✅ Function calling (web search, webpage fetch, callback scheduling)

### Files Modified
- `/public/css/styles.css` - Complete design system overhaul
- `/public/index.html` - Content rebrand for handyman services
- Other pages will be updated to match

### Files to Update Next
- `/public/about/index.html` - Company story
- `/public/contact/index.html` - Contact page
- `/public/service/*` - Convert to handyman service pages
- AI system prompt in `.env` file

---

## Next Steps

1. ✅ Design system (CSS) - COMPLETED
2. 🔄 Homepage redesign - IN PROGRESS  
3. ⏳ Service pages refactor
4. ⏳ About & Contact pages
5. ⏳ AI chatbot prompt update
6. ⏳ Mobile responsive testing

---

*Last Updated: February 2026*
*Design by: AI Agent using SKILL.md frontend design principles*
