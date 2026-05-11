# Product

## Register

product

## Users

Thai university students and general productivity users aged 18–30. They open JamDai on phones and tablets between classes, on laptops during evening study sessions, and occasionally on shared library computers. They need a single surface that answers "what do I need to do today?" without cognitive overhead. Many are first-generation digital-native students who expect interfaces to feel as fluid as the consumer apps they already use (LINE, Instagram, TikTok) but with genuine utility underneath.

## Product Purpose

JamDai is a personal study and productivity operating system. It consolidates to-do management, note-taking, class schedules, Pomodoro focus sessions, and AI-assisted study tools into one unified workspace. Success looks like: a student opens JamDai once in the morning, knows exactly what to tackle, and closes it at night with everything checked off — without ever feeling overwhelmed by the tool itself.

## Brand Personality

Friendly, minimal, quietly confident. JamDai feels like a well-organized desk belonging to someone who has their life together — not because they're rigid, but because they found a system that fits naturally. The personality is warm but not childish, modern but not cold, capable but never intimidating. It speaks Thai naturally and uses casual, encouraging language.

## Anti-references

- Generic SaaS dashboards with navy-blue headers and white card grids (Notion clones, Asana-like layouts)
- Overly decorated "student" apps with cartoon illustrations and pastel overload
- Dark-mode-by-default developer tools that feel intimidating to non-technical users
- Any interface where someone would immediately say "AI generated this" — gradient text, glassmorphism cards everywhere, identical card grids with icon + heading + description repeated, hero-metric templates with big numbers and small labels
- Cookie-cutter Tailwind UI / shadcn templates used without customization

## Design Principles

1. **Clarity over decoration.** Every visual element must serve comprehension. If removing something doesn't hurt understanding, remove it.
2. **Earn every pixel.** No filler sections, no placeholder patterns. White space is intentional rhythm, not laziness.
3. **Feel human, not generated.** Layouts should have asymmetry where it serves hierarchy. Typography choices should feel like a designer made them, not a template. Color should feel curated, not computed.
4. **Progressive confidence.** New users see simplicity. Returning users discover depth. Never front-load complexity.
5. **Thai-first, globally literate.** Primary UI language is Thai. Design must account for Thai typography characteristics (no descenders, different visual weight) while maintaining international design quality.

## Accessibility & Inclusion

- WCAG 2.1 AA minimum for all interactive elements
- Touch targets minimum 44×44px for mobile (primary platform)
- Support for system-level dark mode preference
- Reduced motion support via `prefers-reduced-motion`
- Thai language screen reader compatibility where possible
- Color choices must remain distinguishable under protanopia and deuteranopia
