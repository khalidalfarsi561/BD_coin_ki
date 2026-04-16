<div align="center">
  <img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Dragon Ball Ki Battle

A polished Dragon Ball–themed idle clicker built with Next.js, React, TypeScript, and Tailwind CSS.

## Features

- Full-screen Home view with centered main interaction
- Mining tab with premium card and boost store
- Quests & Achievements with tiered quest categories
- Wallet / prestige system with Dragon Ball progression
- Responsive layout optimized for mobile and desktop
- Persistent local game state in the browser

## Tech Stack

- Next.js 15
- React 19
- TypeScript 5.9
- Tailwind CSS 4
- Lucide React icons

## Run Locally

**Prerequisites:** Node.js 20+

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env.local` from `.env.example` and set your environment variables if needed.
3. Run the app:
   ```bash
   npm run dev
   ```

## Build for Production

```bash
npm run build
```

## Start Production Server

```bash
npm start
```

## Lint

```bash
npm run lint
```

## Notes

- This project uses local browser storage for game progress.
- The included `.env.example` should be used as the base for local environment setup.
- The app is ready to be committed and pushed to GitHub as a public repository.

## GitHub Publishing Checklist

- Add a proper repository name
- Confirm `.gitignore` excludes local environment files and build artifacts
- Ensure `.env.local` is not committed
- Verify `npm run build` succeeds before pushing
- Push the repository to GitHub
