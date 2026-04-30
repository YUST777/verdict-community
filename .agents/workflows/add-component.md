---
description: How to add a new UI component to Verdict
---
# Workflow: Adding a New UI Component

1.  **Placement**: Add common UI elements to `src/components/ui`. Add feature-specific components to `src/components/mirror/[feature]`.
2.  **Styling**: Use Tailwind CSS classes. Follow the "glassmorphism" aesthetic:
    - `bg-white/[0.03]`
    - `backdrop-blur-sm`
    - `border border-white/[0.08]`
3.  **Icons**: Use `lucide-react`.
4.  **Animations**: Use `framer-motion` (check `AnimatedGroup` in `features-10.tsx` for examples).
5.  **Responsiveness**: Always test with `sm:`, `md:`, and `lg:` prefixes.
