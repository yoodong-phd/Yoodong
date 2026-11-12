# Anatomy Quest design system

Hallmark v2 application redesign. Preserve the existing green accent and Korean sans-serif voice. The student’s primary task is completing the next available lesson.

## Tokens

`public/tokens.css` owns colors, fonts, spacing, motion, and layers. The accent is `#17745c`, ink `#20382e`, and background `#f5f7f4`. Use a Korean system-font stack without requiring an external font request. Existing rare professor and atlas states retain centralized legacy color aliases.

`public/base.css` supplies defaults, keyboard focus, horizontal overflow clipping, and reduced-motion support. `public/style.css` contains the existing screen styles and the application redesign overrides.

## Screens

- Login: explanatory content beside the form on desktop, stacked on mobile; student, registration, professor, and guest paths remain available.
- Student home: next lesson and curriculum first; 3D entry and chapter objectives beside them on desktop. On phones, use one column with the same destinations available from the bottom menu.
- Lessons: readable question and answer text, distinct selected/correct/incorrect states. Navigation follows the quiz in document flow to keep answer controls unobstructed.
- Professor: preserve tables, question-bank editor, import/export, draft/save behavior, and confirmations.
- Atlas: preserve all 177 structures and teaching cards. Camera, zoom/focus/reset, opacity, and isolate controls occupy separate rows.

## Interaction

Use the existing SVG icon family for application chrome. Preserve instructor-authored curriculum content, all handler attributes, field names, and server APIs. Main controls have at least 44px targets. Keyboard focus is immediate, numbers use tabular figures, and reduced-motion settings disable animated transitions.

## Exports

The source of truth is CSS custom properties in `public/tokens.css`. Both local development and the self-contained Worker serve `/tokens.css` and `/base.css` alongside `/style.css`.
