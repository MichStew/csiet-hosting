# Repository Guidelines

## Project Structure & Module Organization
The React 19 + Vite frontend lives under `src/`. `main.jsx` wires the app into `index.html`, while `App.jsx` coordinates navigation and imports feature views from `src/components`. Shared Tailwind layers and resets live in `src/styles/index.css`, and any media assets belong in `src/assets`. Place static files that should bypass the bundler (favicons, manifest) in `public/`. Keep build and tooling config files (`vite.config.js`, `tailwind.config.js`, `eslint.config.js`) at the root and document any new configuration changes in `README.md`.

## Build, Test, and Development Commands
Install dependencies with `npm install`. Use `npm run dev` for hot-reload development. Run `npm run build` before cutting a release to ensure the production bundle compiles. `npm run preview` serves that bundle for smoke testing. Enforce linting with `npm run lint` prior to opening or updating a pull request.

## Coding Style & Naming Conventions
Follow the ESLint setup in `eslint.config.js`; the codebase assumes functional React components with hooks. Use 2-space indentation, PascalCase filenames for components (`MemberInfo.jsx`), camelCase for variables, and SCREAMING_SNAKE_CASE for constants. Favor Tailwind utility classes for styling; when utilities are insufficient, colocate minimal CSS modules alongside the component. Export one default React component per file and group small helpers in the same module when tightly coupled.

## Testing Guidelines
Automated tests are not yet configured. When introducing them, add Vitest + React Testing Library and colocate specs as `<Component>.test.jsx` files near the components they cover or under `src/__tests__`. Stub remote calls and keep fixtures in `src/__fixtures__`. Until a dedicated test runner is added, run `npm run lint` and perform manual verification of affected flows; document additional test commands in `package.json`.

## Commit & Pull Request Guidelines
Existing history is terse; standardize on imperative, present-tense commit subjects (e.g., `Add member directory view`) limited to ~72 characters. Add brief bodies when referencing issues or explaining edge cases. Pull requests should capture the problem, the solution approach, and test evidence (commands + outcomes). Include screenshots or recordings for visual changes, and mark TODOs or follow-ups before requesting review.

## Environment & Configuration Tips
Vite only exposes environment variables prefixed with `VITE_`; save them in `.env.local` and never commit secrets. Update `tailwind.config.js` when adjusting design tokens so that IntelliSense and purge rules stay accurate. Align shared configuration changes with the broader CSIET tooling to avoid drift across sibling projects.
