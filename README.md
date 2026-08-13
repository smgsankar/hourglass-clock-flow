# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/1354d223-d454-4979-ad96-cfc0607ef3b0

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/1354d223-d454-4979-ad96-cfc0607ef3b0) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Design system & accessibility

The UI is driven entirely by the CSS custom properties in `src/index.css`,
surfaced to Tailwind in `tailwind.config.ts`. Please keep to these conventions
when adding UI:

- **Use the tokens, not raw colours.** `bg-background`, `text-muted-foreground`,
  `border-border` and friends. Every token pair in `src/index.css` is annotated
  with the contrast ratio it achieves, and both the light and dark themes are
  checked against WCAG 2.1 AA (4.5:1 body text, 3:1 large text and borders).
- **Never signal state with colour alone.** Timer status carries an icon and a
  word as well as a colour; so does the "less than a minute left" warning.
- **Interactive targets are at least 44×44px** — use `min-h-touch` / `h-touch`.
- **Focus is always visible.** A global `:focus-visible` outline is defined in
  `src/index.css`; don't remove it per-component.
- **Animation is optional.** `prefers-reduced-motion: reduce` disables all
  animation and transitions globally, so decorative motion must never be the
  only way information is conveyed.
- **Talk to assistive tech deliberately.** `MM:SS` is read out inconsistently by
  screen readers, so anything exposed to AT uses `formatSpokenTime` from
  `src/lib/time.ts`. Countdown announcements are throttled by
  `shouldAnnounceRemaining` rather than firing every second.

### Scripts

```sh
npm run dev        # dev server on :8080
npm run build      # production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npm test           # node:test unit tests (requires Node >= 22.6 for TS support)
```

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/1354d223-d454-4979-ad96-cfc0607ef3b0) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
