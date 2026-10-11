# MaxiCareer — Career Guidance & Mentorship Platform

> **"Your Career Journey Starts with the Right Guidance."**

MaxiCareer is a career guidance and mentorship landing website designed for students and aspiring professionals seeking structured roadmaps, skill development, 1-on-1 mentorship, and dedicated career placement support.

---

## 🚀 Live Preview & Quick Start

### 1. Installation
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
The application will launch on `http://localhost:3000`.

### 3. Production Build
```bash
npm run build
```

---

## 📁 Project Structure

```text
/
├── .env.example                # Documented environment variables
├── index.html                  # HTML entry point, SEO metadata & Google Fonts
├── metadata.json               # Applet metadata configuration
├── package.json                # Dependencies and npm scripts
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite configuration with /api/contact handler
├── public/
│   └── images/
│       ├── maxicareer-logo.png # Official brand logo (transparent PNG)
│       ├── maxicareer-logo.svg # Scalable vector brand logo
│       ├── maxicareer-icon.svg # Brand icon badge & favicon
│       ├── hero-illustration.svg # Hero roadmap vector visual
│       ├── mentor-illustration.svg # Mentorship collaborative visual
│       └── student-illustration.svg # Student milestone visual
└── src/
    ├── App.tsx                 # Main application landing page orchestrator
    ├── index.css               # Tailwind CSS, theme colors, reduced-motion rules
    ├── main.tsx                # React DOM root entry
    ├── components/
    │   ├── AnimatedBackground.tsx # Subtle floating ambient light blobs
    │   ├── Navbar.tsx             # Sticky responsive navigation & mobile menu
    │   ├── Hero.tsx               # Hero banner with trust pills and CTAs
    │   ├── AboutSection.tsx       # About MaxiCareer and 3 core pillar cards
    │   ├── ServicesSection.tsx    # 4 core services with interactive modal details
    │   ├── ServiceDetailModal.tsx # Full curriculum & deliverables detail modal
    │   ├── WhyChooseUs.tsx        # 2-column layout with 6 core advantages
    │   ├── HowItWorks.tsx         # 3-step numbered roadmap timeline
    │   ├── BenefitsSection.tsx    # 6 tangible outcome benefit cards
    │   ├── Testimonials.tsx       # Student feedback cards (sample demo labeled)
    │   ├── CTASection.tsx         # High-contrast action banner
    │   ├── ContactSection.tsx     # Validated consultation form & API integration
    │   ├── Footer.tsx             # Brand footer, privacy & terms modals
    │   ├── ScrollToTop.tsx        # Floating return-to-top button
    │   └── SectionHeading.tsx     # Reusable typography heading component
    ├── lib/
    │   ├── utils.ts               # Smooth scroll and helper utilities
    │   └── validations.ts         # Zod schema definitions for form inputs
    └── types/
        └── index.ts               # Shared TypeScript interfaces and types
```

---

## 🎨 Color Palette

- **Deep Navy:** `#0F172A`
- **Professional Blue:** `#2563EB`
- **Sky Blue:** `#38BDF8`
- **Light Blue:** `#EFF6FF`
- **White:** `#FFFFFF`
- **Soft Background:** `#F8FAFC`
- **Dark Text:** `#1E293B`

---

## ⚙️ Environment Variables

Declared in `.env.example`:

```env
# Optional target email for forwarding consultation requests
CONTACT_EMAIL=

# Optional Resend API key for automated email delivery
RESEND_API_KEY=
```

---

## 🚢 Deployment Instructions

### GitHub Repository
```bash
git init
git add .
git commit -m "feat: Initial commit of MaxiCareer website"
git branch -M main
git remote add origin https://github.com/<your-username>/maxicareer.git
git push -u origin main
```

### Vercel Deployment
1. Connect your GitHub account at [Vercel](https://vercel.com).
2. Click **New Project** and import `maxicareer`.
3. Framework Preset: Vite / React.
4. Output Directory: `dist`.
5. Click **Deploy**.

---

## ✨ Implemented Features

1. **Sticky Header & Mobile Drawer:** Transparent-to-glassmorphism transitions, animated hamburger drawer, active section highlights.
2. **Official Logo Integration:** Standardized at `public/images/maxicareer-logo.png` with auto-fallback to SVG vector.
3. **Interactive Hero Section:** Clear value proposition, trust pill indicators, direct action buttons.
4. **Interactive Services & Detail Modals:** 4 comprehensive service cards with roadmap exploration modals and direct booking triggers.
5. **Timeline Stepper:** 3-step progressive numbered guide with connected timeline accents.
6. **Robust Consultation Form:** Built with Zod validation, required field checks, email format validation, loading state, error alerts, and success confirmations.
7. **Production API Route:** `POST /api/contact` handling with mock log simulation and production email webhook readiness.
8. **Accessibility & Reduced Motion:** Full `prefers-reduced-motion` compliance, keyboard-friendly focus rings, ARIA labels, semantic markup.
9. **Zero Dead Links:** Every button and anchor scrolls or opens its corresponding section or modal.
