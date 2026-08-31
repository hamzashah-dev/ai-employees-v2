/**
 * The job props an employee's avatar can wear.
 *
 * ## Why the artwork is vendored rather than imported
 *
 * These forty glyphs are `flat-color-icons` (Icons8, MIT) — the full package is 329 icons and
 * ~180 KB, of which we draw 20 KB. Vendoring only what we use keeps the bundle honest and,
 * more importantly, **pins the artwork**: an upstream redraw cannot silently repaint every
 * avatar in the product between two `npm install`s.
 *
 * They deliberately do **not** live in `src/icons/`. That directory is a byte-faithful mirror
 * of the monorepo's `packages/icons`, refreshed with `rsync`, so anything added there is
 * reverted by the next refresh. These are this app's own assets and belong in its own tree.
 *
 * ## Why raw hexes are correct here
 *
 * Every other colour in this app is a token, and that rule holds — but these strings are SVG
 * `fill` attributes inside a `<path>`, never a `className`. There is also nothing to borrow:
 * the ramps describe surfaces and text, and a prop's colours belong to the illustration. The
 * same call is already made for the identity hues in `constants/identity`.
 *
 * ## The constraint multicolour creates
 *
 * Unlike a monochrome icon, a prop carries its own hue and will fight a body painted too close
 * to it — `bullish` is a green glyph and would disappear on a green employee. `PROP_HUE`
 * records each glyph's dominant colour so `getIdentity` can pick a body hue that clears it.
 * That is what lets the prop sit directly on the body with no chip or plate behind it.
 */

export interface AvatarProp {
  /** The `flat-color-icons` id this was vendored from, so it can be re-pulled. */
  icon: string
  /** What wearing this prop claims about the job. Drives a picker's accessible name. */
  meaning: string
  /** Inner SVG markup, authored on a 48-unit grid. */
  body: string
}

/** Every prop is drawn on this grid; the renderer scales from it. */
export const PROP_GRID = 48

/** How far a body hue must sit from its prop's dominant hue, in degrees. */
export const MIN_PROP_HUE_SEPARATION = 60

export const AVATAR_PROPS = {
  'search': {
    icon: 'search',
    meaning: 'Research, finding, discovery',
    body:
      '<g fill="#616161"><path d="m29.175 31.99l2.828-2.827l12.019 12.019l-2.828 2.827z"/><circle cx="20" cy="20" r="16"/></g><path fill="#37474F" d="m32.45 35.34l2.827-2.828l8.696 8.696l-2.828 2.828z"/><circle cx="20" cy="20" r="13" fill="#64B5F6"/><path fill="#BBDEFB" d="M26.9 14.2c-1.7-2-4.2-3.2-6.9-3.2s-5.2 1.2-6.9 3.2c-.4.4-.3 1.1.1 1.4c.4.4 1.1.3 1.4-.1C16 13.9 17.9 13 20 13s4 .9 5.4 2.5c.2.2.5.4.8.4c.2 0 .5-.1.6-.2c.4-.4.4-1.1.1-1.5"/>',
  },
  'binoculars': {
    icon: 'binoculars',
    meaning: 'Watching, monitoring a target',
    body:
      '<g fill="#37474F"><circle cx="33" cy="16" r="6"/><circle cx="15" cy="16" r="6"/><path d="m46.7 25l-15.3 3H16.7L1.4 25l4.3-7.9C6.8 15.2 8.8 14 11 14h26.2c2.2 0 4.2 1.2 5.3 3.1z"/><circle cx="38" cy="30" r="10"/><circle cx="10" cy="30" r="10"/><circle cx="24" cy="28" r="5"/></g><circle cx="24" cy="28" r="2" fill="#546E7A"/><g fill="#a0f"><circle cx="38" cy="30" r="7"/><circle cx="10" cy="30" r="7"/></g><path fill="#CE93D8" d="M41.7 27.7c-1-1.1-2.3-1.7-3.7-1.7s-2.8.6-3.7 1.7c-.4.4-.3 1 .1 1.4s1 .3 1.4-.1c1.2-1.3 3.3-1.3 4.5 0c.2.2.5.3.7.3s.5-.1.7-.3c.4-.3.4-.9 0-1.3M10 26c-1.4 0-2.8.6-3.7 1.7c-.4.4-.3 1 .1 1.4s1 .3 1.4-.1c1.2-1.3 3.3-1.3 4.5 0c.2.2.5.3.7.3s.5-.1.7-.3c.4-.4.4-1 .1-1.4c-1-1-2.4-1.6-3.8-1.6"/>',
  },
  'inspection': {
    icon: 'inspection',
    meaning: 'Audit, review, verification',
    body:
      '<path fill="#455A64" d="M36 4H26c0 1.1-.9 2-2 2s-2-.9-2-2H12C9.8 4 8 5.8 8 8v32c0 2.2 1.8 4 4 4h24c2.2 0 4-1.8 4-4V8c0-2.2-1.8-4-4-4"/><path fill="#fff" d="M36 41H12c-.6 0-1-.4-1-1V8c0-.6.4-1 1-1h24c.6 0 1 .4 1 1v32c0 .6-.4 1-1 1"/><g fill="#90A4AE"><path d="M26 4c0 1.1-.9 2-2 2s-2-.9-2-2h-7v4c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4z"/><path d="M24 0c-2.2 0-4 1.8-4 4s1.8 4 4 4s4-1.8 4-4s-1.8-4-4-4m0 6c-1.1 0-2-.9-2-2s.9-2 2-2s2 .9 2 2s-.9 2-2 2"/></g><path fill="#4CAF50" d="m30.6 18.6l-9 9l-4.2-4.3l-2.5 2.5l6.8 6.7l11.4-11.4z"/>',
  },
  'survey': {
    icon: 'survey',
    meaning: 'Surveys, free-text analysis',
    body:
      '<path fill="#455A64" d="M36 4H26c0 1.1-.9 2-2 2s-2-.9-2-2H12C9.8 4 8 5.8 8 8v32c0 2.2 1.8 4 4 4h24c2.2 0 4-1.8 4-4V8c0-2.2-1.8-4-4-4"/><path fill="#fff" d="M36 41H12c-.6 0-1-.4-1-1V8c0-.6.4-1 1-1h24c.6 0 1 .4 1 1v32c0 .6-.4 1-1 1"/><g fill="#90A4AE"><path d="M26 4c0 1.1-.9 2-2 2s-2-.9-2-2h-7v4c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4z"/><path d="M24 0c-2.2 0-4 1.8-4 4s1.8 4 4 4s4-1.8 4-4s-1.8-4-4-4m0 6c-1.1 0-2-.9-2-2s.9-2 2-2s2 .9 2 2s-.9 2-2 2"/></g><path fill="#CFD8DC" d="M21 20h12v2H21zm-6-1h4v4h-4z"/><path fill="#03A9F4" d="M21 29h12v2H21zm-6-1h4v4h-4z"/>',
  },
  'calendar': {
    icon: 'calendar',
    meaning: 'Scheduling, the week',
    body:
      '<path fill="#CFD8DC" d="M5 38V14h38v24c0 2.2-1.8 4-4 4H9c-2.2 0-4-1.8-4-4"/><path fill="#F44336" d="M43 10v6H5v-6c0-2.2 1.8-4 4-4h30c2.2 0 4 1.8 4 4"/><g fill="#B71C1C"><circle cx="33" cy="10" r="3"/><circle cx="15" cy="10" r="3"/></g><path fill="#B0BEC5" d="M33 3c-1.1 0-2 .9-2 2v5c0 1.1.9 2 2 2s2-.9 2-2V5c0-1.1-.9-2-2-2M15 3c-1.1 0-2 .9-2 2v5c0 1.1.9 2 2 2s2-.9 2-2V5c0-1.1-.9-2-2-2"/><path fill="#90A4AE" d="M13 20h4v4h-4zm6 0h4v4h-4zm6 0h4v4h-4zm6 0h4v4h-4zm-18 6h4v4h-4zm6 0h4v4h-4zm6 0h4v4h-4zm6 0h4v4h-4zm-18 6h4v4h-4zm6 0h4v4h-4zm6 0h4v4h-4zm6 0h4v4h-4z"/>',
  },
  'alarm-clock': {
    icon: 'alarm-clock',
    meaning: 'Reminders, sleep, time',
    body:
      '<path fill="#37474F" d="m38.5 44.6l-4-4l2.1-2.1l4 4c.6.6.6 1.5 0 2.1c-.5.5-1.5.5-2.1 0m-29 0l4-4l-2.1-2.1l-4 4c-.6.6-.6 1.5 0 2.1c.5.5 1.5.5 2.1 0"/><circle cx="24" cy="24" r="20" fill="#C62828"/><circle cx="24" cy="24" r="16" fill="#eee"/><path fill="#E53935" d="m15.096 33.48l-.566-.566l9.191-9.191l.566.565z"/><path d="M23 11h2v13h-2z"/><path d="M31.285 29.654L29.66 31.28l-6.504-6.504l1.626-1.627z"/><circle cx="24" cy="24" r="2"/><circle cx="24" cy="24" r="1" fill="#C62828"/><path fill="#37474F" d="M22 1h4v3h-4zm22.4 15.2c2.5-3.5 2.1-8.4-1-11.5s-8-3.5-11.5-1zm-40.8 0c-2.5-3.5-2.1-8.4 1-11.5s8-3.5 11.5-1z"/>',
  },
  'todo-list': {
    icon: 'todo-list',
    meaning: 'Tasks, admin, checklists',
    body:
      '<path fill="#3F51B5" d="m17.8 18.1l-7.4 7.3l-4.2-4.1L4 23.5l6.4 6.4l9.6-9.6zm0-13l-7.4 7.3l-4.2-4.1L4 10.5l6.4 6.4L20 7.3zm0 26l-7.4 7.3l-4.2-4.1L4 36.5l6.4 6.4l9.6-9.6z"/><path fill="#90CAF9" d="M24 22h20v4H24zm0-13h20v4H24zm0 26h20v4H24z"/>',
  },
  'manager': {
    icon: 'manager',
    meaning: 'Leadership, holding the week',
    body:
      '<path fill="#FF9800" d="m24 37l-5-6v-6h10v6z"/><g fill="#FFA726"><circle cx="33" cy="19" r="2"/><circle cx="15" cy="19" r="2"/></g><path fill="#FFB74D" d="M33 13c0-7.6-18-5-18 0v7c0 5 4 9 9 9s9-4 9-9z"/><path fill="#FF5722" d="M24 4c-6.1 0-10 4.9-10 11v2.3l2 1.7v-5l12-4l4 4v5l2-1.7V15c0-4-1-8-6-9l-1-2z"/><g fill="#784719"><circle cx="28" cy="19" r="1"/><circle cx="20" cy="19" r="1"/></g><path fill="#CFD8DC" d="m29 31l-5 1l-5-1S8 33 8 44h32c0-11-11-13-11-13"/><path fill="#3F51B5" d="m23 35l-1 9h4l-1-9l1-1l-2-2l-2 2z"/>',
  },
  'conference-call': {
    icon: 'conference-call',
    meaning: 'People, hiring, community',
    body:
      '<circle cx="12" cy="21" r="5" fill="#FFA726"/><path fill="#455A64" d="M2 34.7s2.8-6.3 10-6.3s10 6.3 10 6.3V38H2zm44 0s-2.8-6.3-10-6.3s-10 6.3-10 6.3V38h20z"/><circle cx="24" cy="17" r="6" fill="#FFB74D"/><path fill="#607D8B" d="M36 34.1s-3.3-7.5-12-7.5s-12 7.5-12 7.5V38h24z"/><circle cx="36" cy="21" r="5" fill="#FFA726"/><circle cx="12" cy="21" r="5" fill="#FFA726"/><circle cx="36" cy="21" r="5" fill="#FFA726"/>',
  },
  'businessman': {
    icon: 'businessman',
    meaning: 'Accounts, individual contacts',
    body:
      '<path fill="#FF9800" d="m24 37l-5-6v-6h10v6z"/><g fill="#FFA726"><circle cx="33" cy="19" r="2"/><circle cx="15" cy="19" r="2"/></g><path fill="#FFB74D" d="M33 13c0-7.6-18-5-18 0v7c0 5 4 9 9 9s9-4 9-9z"/><path fill="#424242" d="M24 4c-6.1 0-10 4.9-10 11v2.3l2 1.7v-5l12-4l4 4v5l2-1.7V15c0-4-1-8-6-9l-1-2z"/><g fill="#784719"><circle cx="28" cy="19" r="1"/><circle cx="20" cy="19" r="1"/></g><path fill="#fff" d="m24 43l-5-12l5 1l5-1z"/><path fill="#D32F2F" d="m23 35l-.7 4.5l1.7 4l1.7-4L25 35l1-1l-2-2l-2 2z"/><path fill="#546E7A" d="m29 31l-5 12l-5-12S8 33 8 44h32c0-11-11-13-11-13"/>',
  },
  'briefcase': {
    icon: 'briefcase',
    meaning: 'Business operations, vendors',
    body:
      '<path fill="#424242" d="M27 7h-6c-1.7 0-3 1.3-3 3v3h2v-3c0-.6.4-1 1-1h6c.6 0 1 .4 1 1v3h2v-3c0-1.7-1.3-3-3-3"/><path fill="#E65100" d="M40 43H8c-2.2 0-4-1.8-4-4V15c0-2.2 1.8-4 4-4h32c2.2 0 4 1.8 4 4v24c0 2.2-1.8 4-4 4"/><path fill="#FF6E40" d="M40 28H8c-2.2 0-4-1.8-4-4v-9c0-2.2 1.8-4 4-4h32c2.2 0 4 1.8 4 4v9c0 2.2-1.8 4-4 4"/><path fill="#FFF3E0" d="M26 26h-4c-.6 0-1-.4-1-1v-2c0-.6.4-1 1-1h4c.6 0 1 .4 1 1v2c0 .6-.4 1-1 1"/>',
  },
  'command-line': {
    icon: 'command-line',
    meaning: 'Code, shells, engineering',
    body:
      '<path fill="#CFD8DC" d="M41 6H7c-.6 0-1 .4-1 1v35h36V7c0-.6-.4-1-1-1"/><path fill="#263238" d="M8 13h32v27H8z"/><path fill="#76FF03" d="M22 27.6c-.1 1.1-.4 1.9-1 2.5s-1.4.9-2.5.9s-2-.4-2.6-1.1s-.9-1.8-.9-3.1v-1.6c0-1.3.3-2.4.9-3.1s1.5-1.1 2.6-1.1s1.9.3 2.5.9s.9 1.4 1 2.6h-2c0-.7-.1-1.2-.3-1.4c-.2-.3-.6-.4-1.1-.4q-.75 0-1.2.6c-.2.4-.3 1-.4 1.8v1.8c0 1 .1 1.6.3 2s.6.5 1.1.5s.9-.1 1.1-.4s.3-.7.3-1.4zm2-3.6c0-.3.1-.5.3-.7s.4-.3.7-.3s.5.1.7.3s.3.4.3.7s-.1.5-.3.7s-.4.3-.7.3s-.5-.1-.7-.3s-.3-.4-.3-.7m0 6c0-.3.1-.5.3-.7s.4-.3.7-.3s.5.1.7.3s.3.4.3.7s-.1.5-.3.7s-.4.3-.7.3s-.5-.1-.7-.3s-.3-.4-.3-.7m4-9h2l3 10h-2z"/><g fill="#90A4AE"><circle cx="13.5" cy="9.5" r="1.5"/><circle cx="9.5" cy="9.5" r="1.5"/></g>',
  },
  'deployment': {
    icon: 'deployment',
    meaning: 'Releases, on-call, shipping code',
    body:
      '<path fill="#B0BEC5" d="M37 42H5V32h32c2.8 0 5 2.2 5 5s-2.2 5-5 5"/><path fill="#37474F" d="M10 34c-1.7 0-3 1.3-3 3s1.3 3 3 3s3-1.3 3-3s-1.3-3-3-3m0 4c-.6 0-1-.4-1-1s.4-1 1-1s1 .4 1 1s-.4 1-1 1m9-4c-1.7 0-3 1.3-3 3s1.3 3 3 3s3-1.3 3-3s-1.3-3-3-3m0 4c-.6 0-1-.4-1-1s.4-1 1-1s1 .4 1 1s-.4 1-1 1m18-4c-1.7 0-3 1.3-3 3s1.3 3 3 3s3-1.3 3-3s-1.3-3-3-3m0 4c-.6 0-1-.4-1-1s.4-1 1-1s1 .4 1 1s-.4 1-1 1m-9-4c-1.7 0-3 1.3-3 3s1.3 3 3 3s3-1.3 3-3s-1.3-3-3-3m0 4c-.6 0-1-.4-1-1s.4-1 1-1s1 .4 1 1s-.4 1-1 1"/><path fill="#FF9800" d="M35 31H11c-1.1 0-2-.9-2-2V7c0-1.1.9-2 2-2h24c1.1 0 2 .9 2 2v22c0 1.1-.9 2-2 2"/><path fill="#8A5100" d="M26.5 13h-7c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5h7c.8 0 1.5.7 1.5 1.5s-.7 1.5-1.5 1.5"/><path fill="#607D8B" d="M37 31H5v2h32c2.2 0 4 1.8 4 4s-1.8 4-4 4H5v2h32c3.3 0 6-2.7 6-6s-2.7-6-6-6"/>',
  },
  'puzzle': {
    icon: 'puzzle',
    meaning: 'Tests, dependencies, integrations',
    body:
      '<path fill="#8BC34A" d="M39 15c0-2.2-1.8-4-4-4h-6c-.7 0-1.1-.8-.7-1.4c.6-1 .9-2.2.6-3.5c-.4-2-1.9-3.6-3.8-4C21.8 1.4 19 3.9 19 7c0 1 .3 1.8.7 2.6c.4.6 0 1.4-.8 1.4h-6c-2.2 0-4 1.8-4 4v7c0 .7.8 1.1 1.4.7c1-.6 2.2-.9 3.5-.6c2 .4 3.6 1.9 4 3.8c.7 3.2-1.8 6.1-4.9 6.1c-1 0-1.8-.3-2.6-.7c-.5-.4-1.3 0-1.3.7v6c0 2.2 1.8 4 4 4h22c2.2 0 4-1.8 4-4z"/>',
  },
  'document': {
    icon: 'document',
    meaning: 'Writing, drafts, documentation',
    body:
      '<path fill="#90CAF9" d="M40 45H8V3h22l10 10z"/><path fill="#E1F5FE" d="M38.5 14H29V4.5z"/><path fill="#1976D2" d="M16 21h17v2H16zm0 4h13v2H16zm0 4h17v2H16zm0 4h13v2H16z"/>',
  },
  'news': {
    icon: 'news',
    meaning: 'Publishing, newsletters, blogs',
    body:
      '<path fill="#FF5722" d="M32 15v28H10c-2.2 0-4-1.8-4-4V15z"/><path fill="#FFCCBC" d="M14 5v34c0 2.2-1.8 4-4 4h29c2.2 0 4-1.8 4-4V5z"/><path fill="#FF5722" d="M20 10h18v4H20zm0 7h8v2h-8zm10 0h8v2h-8zm-10 4h8v2h-8zm10 0h8v2h-8zm-10 4h8v2h-8zm10 0h8v2h-8zm-10 4h8v2h-8zm10 0h8v2h-8zm-10 4h8v2h-8zm10 0h8v2h-8zm-10 4h8v2h-8zm10 0h8v2h-8z"/>',
  },
  'reading': {
    icon: 'reading',
    meaning: 'Reading, study, papers',
    body:
      '<path fill="#5C6BC0" d="M40 40c-6.9 0-16 4-16 4V22s9-4 18-4z"/><path fill="#7986CB" d="M8 40c6.9 0 16 4 16 4V22s-9-4-18-4z"/><g fill="#FFB74D"><circle cx="24" cy="12" r="8"/><path d="M41 32h1c.6 0 1-.4 1-1v-4c0-.6-.4-1-1-1h-1c-1.7 0-3 1.3-3 3s1.3 3 3 3M7 26H6c-.6 0-1 .4-1 1v4c0 .6.4 1 1 1h1c1.7 0 3-1.3 3-3s-1.3-3-3-3"/></g>',
  },
  'graduation-cap': {
    icon: 'graduation-cap',
    meaning: 'Learning, tutoring, exams',
    body:
      '<g fill="#37474F"><path d="M9 20h30v13H9z"/><ellipse cx="24" cy="33" rx="15" ry="6"/></g><path fill="#78909C" d="M23.1 8.2L.6 18.1c-.8.4-.8 1.5 0 1.9l22.5 9.9q.9.3 1.8 0L47.4 20c.8-.4.8-1.5 0-1.9L24.9 8.2q-.9-.45-1.8 0"/><g fill="#37474F"><path d="m43.2 20.4l-20-3.4c-.5-.1-1.1.3-1.2.8s.3 1.1.8 1.2L42 22.2V37c0 .6.4 1 1 1s1-.4 1-1V21.4c0-.5-.4-.9-.8-1"/><circle cx="43" cy="37" r="2"/><path d="M46 40c0 1.7-3 6-3 6s-3-4.3-3-6s1.3-3 3-3s3 1.3 3 3"/></g>',
  },
  'calculator': {
    icon: 'calculator',
    meaning: 'Numbers, tax, budgeting',
    body:
      '<path fill="#616161" d="M40 16H8v24c0 2.2 1.8 4 4 4h24c2.2 0 4-1.8 4-4z"/><path fill="#424242" d="M36 4H12C9.8 4 8 5.8 8 8v9h32V8c0-2.2-1.8-4-4-4"/><path fill="#9CCC65" d="M36 14H12c-.6 0-1-.4-1-1V8c0-.6.4-1 1-1h24c.6 0 1 .4 1 1v5c0 .6-.4 1-1 1"/><path fill="#33691E" d="M33 10h2v2h-2zm-4 0h2v2h-2z"/><path fill="#FF5252" d="M36 23h-3c-.6 0-1-.4-1-1v-2c0-.6.4-1 1-1h3c.6 0 1 .4 1 1v2c0 .6-.4 1-1 1"/><path fill="#E0E0E0" d="M15 23h-3c-.6 0-1-.4-1-1v-2c0-.6.4-1 1-1h3c.6 0 1 .4 1 1v2c0 .6-.4 1-1 1m7 0h-3c-.6 0-1-.4-1-1v-2c0-.6.4-1 1-1h3c.6 0 1 .4 1 1v2c0 .6-.4 1-1 1m7 0h-3c-.6 0-1-.4-1-1v-2c0-.6.4-1 1-1h3c.6 0 1 .4 1 1v2c0 .6-.4 1-1 1m-14 6h-3c-.6 0-1-.4-1-1v-2c0-.6.4-1 1-1h3c.6 0 1 .4 1 1v2c0 .6-.4 1-1 1m7 0h-3c-.6 0-1-.4-1-1v-2c0-.6.4-1 1-1h3c.6 0 1 .4 1 1v2c0 .6-.4 1-1 1m7 0h-3c-.6 0-1-.4-1-1v-2c0-.6.4-1 1-1h3c.6 0 1 .4 1 1v2c0 .6-.4 1-1 1m-14 6h-3c-.6 0-1-.4-1-1v-2c0-.6.4-1 1-1h3c.6 0 1 .4 1 1v2c0 .6-.4 1-1 1m7 0h-3c-.6 0-1-.4-1-1v-2c0-.6.4-1 1-1h3c.6 0 1 .4 1 1v2c0 .6-.4 1-1 1m7 0h-3c-.6 0-1-.4-1-1v-2c0-.6.4-1 1-1h3c.6 0 1 .4 1 1v2c0 .6-.4 1-1 1m-14 6h-3c-.6 0-1-.4-1-1v-2c0-.6.4-1 1-1h3c.6 0 1 .4 1 1v2c0 .6-.4 1-1 1m7 0h-3c-.6 0-1-.4-1-1v-2c0-.6.4-1 1-1h3c.6 0 1 .4 1 1v2c0 .6-.4 1-1 1m7 0h-3c-.6 0-1-.4-1-1v-2c0-.6.4-1 1-1h3c.6 0 1 .4 1 1v2c0 .6-.4 1-1 1"/><path fill="#BDBDBD" d="M36 29h-3c-.6 0-1-.4-1-1v-2c0-.6.4-1 1-1h3c.6 0 1 .4 1 1v2c0 .6-.4 1-1 1m0 6h-3c-.6 0-1-.4-1-1v-2c0-.6.4-1 1-1h3c.6 0 1 .4 1 1v2c0 .6-.4 1-1 1m0 6h-3c-.6 0-1-.4-1-1v-2c0-.6.4-1 1-1h3c.6 0 1 .4 1 1v2c0 .6-.4 1-1 1"/>',
  },
  'currency-exchange': {
    icon: 'currency-exchange',
    meaning: 'Money movement, invoices',
    body:
      '<circle cx="18" cy="18" r="15" fill="#3F51B5"/><path fill="#FFF59D" d="M20.3 16v1.7h-3.8v1.4h3.8v1.7h-3.8c0 .6.1 1.2.3 1.6s.4.8.7 1c.3.3.7.4 1.1.6c.4.1.9.2 1.4.2c.4 0 .7 0 1.1-.1s.7-.1 1-.3l.4 2.7c-.4.1-.9.2-1.4.2c-.5.1-1 .1-1.5.1c-.9 0-1.8-.1-2.6-.4c-.8-.2-1.5-.6-2-1.1c-.6-.5-1-1.1-1.4-1.9c-.3-.7-.5-1.6-.5-2.6h-1.9v-1.7h1.9v-1.4h-1.9V16h1.9c.1-1 .3-1.8.6-2.6c.4-.7.8-1.4 1.4-1.9s1.3-.9 2.1-1.1c.8-.3 1.7-.4 2.6-.4c.4 0 .9 0 1.3.1s.9.1 1.3.3l-.4 2.7c-.3-.1-.6-.2-1-.3s-.7-.1-1.1-.1c-.5 0-1 .1-1.4.2s-.8.3-1 .6c-.3.3-.5.6-.7 1s-.3.9-.3 1.5z"/><circle cx="30" cy="30" r="15" fill="#4CAF50"/><path fill="#fff" d="M28.4 27c.1.2.2.4.4.6s.4.4.7.5c.3.2.7.3 1.1.5c.7.3 1.4.6 2 .9s1.1.7 1.5 1.1s.8.9 1 1.4s.4 1.2.4 1.9s-.1 1.3-.3 1.8s-.5 1-.9 1.4s-.9.7-1.4.9c-.6.2-1.2.4-1.8.5v2.2h-1.8v-2.2c-.6-.1-1.2-.2-1.8-.4s-1.1-.5-1.5-1c-.5-.4-.8-1-1.1-1.6s-.4-1.4-.4-2.3h3.3c0 .5.1 1 .2 1.3c.1.4.3.6.6.9c.2.2.5.4.8.5s.6.1.9.1c.4 0 .7 0 .9-.1c.3-.1.5-.2.7-.4s.3-.4.4-.6s.1-.5.1-.8s0-.6-.1-.8s-.2-.5-.4-.7s-.4-.4-.7-.5c-.3-.2-.7-.3-1.1-.5c-.7-.3-1.4-.6-2-.9s-1.1-.7-1.5-1.1s-.8-.9-1-1.4s-.4-1.2-.4-1.9c0-.6.1-1.2.3-1.7s.5-1 .9-1.4s.9-.7 1.4-1c.5-.2 1.2-.4 1.8-.5v-2.4h1.8v2.4q.9.15 1.8.6c.5.3 1 .6 1.3 1.1c.4.4.7 1 .9 1.6s.3 1.3.3 2h-3.3c0-.9-.2-1.6-.6-2s-.9-.7-1.5-.7c-.3 0-.6.1-.9.2c-.2.1-.4.2-.6.4q-.3.3-.3.6c-.1.2-.1.5-.1.8c-.1.2 0 .5 0 .7"/>',
  },
  'bullish': {
    icon: 'bullish',
    meaning: 'Growth, performance up',
    body:
      '<path fill="#4CAF50" d="M40 21h4v23h-4zm-6 7h4v16h-4zm-6-5h4v21h-4zm-6 6h4v15h-4zm-6 3h4v12h-4zm-6-2h4v14h-4zm-6 4h4v10H4z"/><g fill="#388E3C"><path d="M40.1 9.1L34 15.2l-4-4l-10 10l-5-5L4.6 26.6l2.8 2.8l7.6-7.6l5 5l10-10l4 4l8.9-8.9z"/><path d="M44 8h-9l9 9z"/></g>',
  },
  'line-chart': {
    icon: 'line-chart',
    meaning: 'Analytics, trends',
    body:
      '<g fill="#3F51B5"><circle cx="8" cy="38" r="3"/><circle cx="16" cy="40" r="3"/><circle cx="24" cy="33" r="3"/><circle cx="32" cy="35" r="3"/><circle cx="40" cy="31" r="3"/><path d="m39.1 29.2l-7.3 3.7l-8.3-2.1l-8 7l-7-1.7l-1 3.8l9 2.3l8-7l7.7 1.9l8.7-4.3z"/></g><g fill="#00BCD4"><circle cx="8" cy="20" r="3"/><circle cx="16" cy="22" r="3"/><circle cx="24" cy="15" r="3"/><circle cx="32" cy="20" r="3"/><circle cx="40" cy="8" r="3"/><path d="M38.3 6.9c-2.1 3.2-5.3 8-6.9 10.4c-1.2-.7-3.1-2-6.4-4l-1.3-.8l-8.3 7.3l-7-1.7l-1 3.9l9 2.3l7.7-6.7c2.6 1.6 5.8 3.6 6.5 4.1l.5.5l.9-.1c1.1-.1 1.1-.1 9.5-12.9z"/></g>',
  },
  'bar-chart': {
    icon: 'bar-chart',
    meaning: 'Reporting, comparison',
    body:
      '<path fill="#00BCD4" d="M19 22h10v20H19zM6 12h10v30H6zm26-6h10v36H32z"/>',
  },
  'advertising': {
    icon: 'advertising',
    meaning: 'Marketing, ads, campaigns',
    body:
      '<path fill="#90CAF9" d="M17.4 33H15v-4h4l.4 1.5c.3 1.3-.7 2.5-2 2.5M37 36s-11.8-7-18-7V15c5.8 0 18-7 18-7z"/><g fill="#283593"><circle cx="9" cy="22" r="5"/><path d="M40 19h-3v6h3c1.7 0 3-1.3 3-3s-1.3-3-3-3M18.6 41.2c-.9.6-2.5 1.2-4.6 1.4c-.6.1-1.2-.3-1.4-1L8.2 27.9S17 21.7 17 29c0 5.5 1.5 8.4 2.2 9.5c.5.7.5 1.6 0 2.3c-.2.2-.4.3-.6.4"/></g><path fill="#3F51B5" d="M9 29h10V15H9c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2"/><path fill="#42A5F5" d="M38 38c-1.1 0-2-.9-2-2V8c0-1.1.9-2 2-2s2 .9 2 2v28c0 1.1-.9 2-2 2"/>',
  },
  'headset': {
    icon: 'headset',
    meaning: 'Support, live help',
    body:
      '<path fill="#0097A7" d="M24 5C14.1 5 6 13.1 6 23v15h4V23c0-7.7 6.3-14 14-14s14 6.3 14 14v15h4V23c0-9.9-8.1-18-18-18"/><path fill="#37474F" d="M38 43h-4V31h4c2.2 0 4 1.8 4 4v4c0 2.2-1.8 4-4 4m-28 0h4V31h-4c-2.2 0-4 1.8-4 4v4c0 2.2 1.8 4 4 4"/>',
  },
  'comments': {
    icon: 'comments',
    meaning: 'Replies, chat, threads',
    body:
      '<path fill="#8BC34A" d="M37 39H11l-6 6V11c0-3.3 2.7-6 6-6h26c3.3 0 6 2.7 6 6v22c0 3.3-2.7 6-6 6"/>',
  },
  'picture': {
    icon: 'picture',
    meaning: 'Visual design, thumbnails, art',
    body:
      '<path fill="#F57C00" d="M40 41H8c-2.2 0-4-1.8-4-4V11c0-2.2 1.8-4 4-4h32c2.2 0 4 1.8 4 4v26c0 2.2-1.8 4-4 4"/><circle cx="35" cy="16" r="3" fill="#FFF9C4"/><path fill="#942A09" d="M20 16L9 32h22z"/><path fill="#BF360C" d="m31 22l-8 10h16z"/>',
  },
  'music': {
    icon: 'music',
    meaning: 'Audio, podcast, sound',
    body:
      '<g fill="#E91E63"><circle cx="19" cy="33" r="9"/><path d="M24 6v27h4V14l11 3v-7z"/></g>',
  },
  'film-reel': {
    icon: 'film-reel',
    meaning: 'Video, clips, shorts',
    body:
      '<path fill="#3F51B5" d="M43 39V24h-4v15c0 5 4 9 9 9v-4c-2.8 0-5-2.2-5-5"/><circle cx="24" cy="24" r="19" fill="#90A4AE"/><circle cx="24" cy="24" r="2" fill="#37474F"/><g fill="#253278"><circle cx="24" cy="14" r="5"/><circle cx="24" cy="34" r="5"/><circle cx="34" cy="24" r="5"/><circle cx="14" cy="24" r="5"/></g>',
  },
  'idea': {
    icon: 'idea',
    meaning: 'Ideation, strategy, launch',
    body:
      '<circle cx="24" cy="22" r="20" fill="#FFF59D"/><path fill="#FBC02D" d="M37 22c0-7.7-6.6-13.8-14.5-12.9c-6 .7-10.8 5.5-11.4 11.5c-.5 4.6 1.4 8.7 4.6 11.3c1.4 1.2 2.3 2.9 2.3 4.8v.3h12v-.1c0-1.8.8-3.6 2.2-4.8c2.9-2.4 4.8-6 4.8-10.1"/><path fill="#FFF59D" d="m30.6 20.2l-3-2c-.3-.2-.8-.2-1.1 0L24 19.8l-2.4-1.6c-.3-.2-.8-.2-1.1 0l-3 2c-.2.2-.4.4-.4.7s0 .6.2.8l3.8 4.7V37h2V26c0-.2-.1-.4-.2-.6l-3.3-4.1l1.5-1l2.4 1.6c.3.2.8.2 1.1 0l2.4-1.6l1.5 1l-3.3 4.1c-.1.2-.2.4-.2.6v11h2V26.4l3.8-4.7c.2-.2.3-.5.2-.8s-.2-.6-.4-.7"/><circle cx="24" cy="44" r="3" fill="#5C6BC0"/><path fill="#9FA8DA" d="M26 45h-4c-2.2 0-4-1.8-4-4v-5h12v5c0 2.2-1.8 4-4 4"/><path fill="#5C6BC0" d="m30 41l-11.6 1.6c.3.7.9 1.4 1.6 1.8l9.4-1.3q.6-.9.6-2.1m-12-2.3v2L30 39v-2z"/>',
  },
  'signature': {
    icon: 'signature',
    meaning: 'Contracts, policy, legal',
    body:
      '<path fill="#1565C0" d="M38.8 28.2C41.5 24.8 45 20.1 45 12c0-.6-.4-1-1-1s-1 .4-1 1c0 6.7-2.5 10.7-5 13.9c-.6-1.9-1-4.2-1-6.9c0-.5-.4-1-1-1c-.5 0-1 .4-1 1c-.1 1.7-.6 3.6-1 3.8c-.4 0-.9-1.4-1-2.8c0-.5-.5-.9-1-.9s-1 .3-1 .9c-.3 1.7-1.1 4.1-2 4.1c-.4 0-.6-.1-.7-.3c-.3-.3-.4-1-.4-1.6c0-.4.1-.8.1-1.2c0-.5-.4-1-.9-1s-1 .3-1.1.8c0 .1-.1.5-.1 1.1c-.2 1.7-.8 5.1-2.9 5.1c-.7 0-1.1-.2-1.4-.7c-.5-.8-.5-2.1 0-3.3v-.1c.1-.1.1-.3.2-.4c.8-1.6 1.7-2.5 3.2-2.5c.6 0 1-.4 1-1s-.4-1-1-1c-4.2 0-5.4 4.1-6.6 8c-1.4 4.8-2.7 8-6.4 8c-5.1 0-7-6.6-7-11c0-8.6 4.7-14 9-14c2.9 0 4 2.3 4.1 2.4c.2.5.8.7 1.3.5s.7-.8.5-1.3C19.8 10.4 18.2 7 14 7C8.6 7 3 13 3 23c0 10.3 5.9 13 9 13c5.1 0 6.8-4.5 8.1-8.5c.7.9 1.7 1.5 2.9 1.5c2.2 0 3.5-1.6 4.2-3.6q.75.6 1.8.6c1.4 0 2.4-1.2 3-2.4c.4.7 1.1 1.2 2 1.2c.6 0 1.1-.3 1.5-.7c.3 1.4.7 2.7 1 3.8c-1.4 1.8-2.5 3.3-2.5 5.1c0 1.7 1.3 3 3 3c1.8 0 3-1.6 3-3c0-1.3-.5-2.7-1.1-4.3c0-.2-.1-.3-.1-.5M37 34c-.7 0-1-.5-1-1c0-.9.5-1.8 1.3-2.9c.4 1.2.7 2.1.7 2.9c0 .3-.3 1-1 1"/><path fill="#90A4AE" d="M3 40h42v2H3z"/>',
  },
  'package': {
    icon: 'package',
    meaning: 'Shipping, procurement, parcels',
    body:
      '<path fill="#FF9800" d="M38 42H10c-2.2 0-4-1.8-4-4V10c0-2.2 1.8-4 4-4h28c2.2 0 4 1.8 4 4v28c0 2.2-1.8 4-4 4"/><path fill="#8A5100" d="M29.5 16h-11c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5h11c.8 0 1.5.7 1.5 1.5s-.7 1.5-1.5 1.5"/>',
  },
  'shop': {
    icon: 'shop',
    meaning: 'Shopping, groceries, gifts',
    body:
      '<path fill="#CFD8DC" d="M5 19h38v19H5z"/><path fill="#B0BEC5" d="M5 38h38v4H5z"/><path fill="#455A64" d="M27 24h12v18H27z"/><path fill="#E3F2FD" d="M9 24h14v11H9z"/><path fill="#1E88E5" d="M10 25h12v9H10z"/><path fill="#90A4AE" d="M36.5 33.5c-.3 0-.5.2-.5.5v2c0 .3.2.5.5.5s.5-.2.5-.5v-2c0-.3-.2-.5-.5-.5"/><g fill="#558B2F"><circle cx="24" cy="19" r="3"/><circle cx="36" cy="19" r="3"/><circle cx="12" cy="19" r="3"/></g><path fill="#7CB342" d="M40 6H8c-1.1 0-2 .9-2 2v3h36V8c0-1.1-.9-2-2-2m-19 5h6v8h-6zm16 0h-5l1 8h6zm-26 0h5l-1 8H9z"/><g fill="#FFA000"><circle cx="30" cy="19" r="3"/><path d="M45 19c0 1.7-1.3 3-3 3s-3-1.3-3-3s1.3-3 3-3z"/><circle cx="18" cy="19" r="3"/><path d="M3 19c0 1.7 1.3 3 3 3s3-1.3 3-3s-1.3-3-3-3z"/></g><path fill="#FFC107" d="M32 11h-5v8h6zm10 0h-5l2 8h6zm-26 0h5v8h-6zM6 11h5l-2 8H3z"/>',
  },
  'home': {
    icon: 'home',
    meaning: 'Home automation',
    body:
      '<path fill="#E8EAF6" d="M42 39H6V23L24 6l18 17z"/><path fill="#C5CAE9" d="m39 21l-5-5V9h5zM6 39h36v5H6z"/><path fill="#B71C1C" d="M24 4.3L4 22.9l2 2.2L24 8.4l18 16.7l2-2.2z"/><path fill="#D84315" d="M18 28h12v16H18z"/><path fill="#01579B" d="M21 17h6v6h-6z"/><path fill="#FF8A65" d="M27.5 35.5c-.3 0-.5.2-.5.5v2c0 .3.2.5.5.5s.5-.2.5-.5v-2c0-.3-.2-.5-.5-.5"/>',
  },
  'electricity': {
    icon: 'electricity',
    meaning: 'Energy, devices, repair',
    body:
      '<path fill="#00BCD4" d="M33.7 5L22 17l15 5l-15.7 14.7l5.1 2.8L12 43l2.7-14.8l2.9 5.1L27 24l-15-5L25 5z"/>',
  },
  'privacy': {
    icon: 'privacy',
    meaning: 'Security, privacy, breaches',
    body:
      '<path fill="#424242" d="M24 4c-5.5 0-10 4.5-10 10v4h4v-4c0-3.3 2.7-6 6-6s6 2.7 6 6v4h4v-4c0-5.5-4.5-10-10-10"/><path fill="#FB8C00" d="M36 44H12c-2.2 0-4-1.8-4-4V22c0-2.2 1.8-4 4-4h24c2.2 0 4 1.8 4 4v18c0 2.2-1.8 4-4 4"/><circle cx="24" cy="31" r="6" fill="#EFEBE9"/><circle cx="24" cy="31" r="3" fill="#1E88E5"/><circle cx="26" cy="29" r="1" fill="#fff"/>',
  },
  'key': {
    icon: 'key',
    meaning: 'Access, secrets, credentials',
    body:
      '<g fill="#FFA000"><path d="m30 41l-4 4h-4l-4-4V21h12v8l-2 2l2 2v2l-2 2l2 2z"/><path d="M38 7.8c-.5-1.8-2-3.1-3.7-3.6C31.9 3.7 28.2 3 24 3s-7.9.7-10.3 1.2C12 4.7 10.5 6 10 7.8c-.5 1.7-1 4.1-1 6.7s.5 5 1 6.7c.5 1.8 1.9 3.1 3.7 3.5c2.4.6 6.1 1.3 10.3 1.3s7.9-.7 10.3-1.2c1.8-.4 3.2-1.8 3.7-3.5s1-4.1 1-6.7c0-2.7-.5-5.1-1-6.8M29 13H19c-1.1 0-2-.9-2-2V9c0-.6 3.1-1 7-1s7 .4 7 1v2c0 1.1-.9 2-2 2"/></g><path fill="#D68600" d="M23 26h2v19h-2z"/>',
  },
  'data-backup': {
    icon: 'data-backup',
    meaning: 'Backups, restores',
    body:
      '<path fill="#D1C4E9" d="M38 7H10c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h28c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2m0 12H10c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h28c1.1 0 2-.9 2-2v-6c0-1.1-.9-2-2-2m0 12H10c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h28c1.1 0 2-.9 2-2v-6c0-1.1-.9-2-2-2"/><g fill="#2196F3"><path d="m31 30l7 5.6V24.4z"/><path d="M38 28c-.3 0-.7 0-1 .1v4c.3-.1.7-.1 1-.1c3.3 0 6 2.7 6 6s-2.7 6-6 6s-6-2.7-6-6c0-.3 0-.6.1-.9l-3.4-2.7c-.4 1.1-.7 2.3-.7 3.6c0 5.5 4.5 10 10 10s10-4.5 10-10s-4.5-10-10-10"/></g>',
  },
  'globe': {
    icon: 'globe',
    meaning: 'Travel, language, world',
    body:
      '<path fill="#7CB342" d="M24 4C13 4 4 13 4 24s9 20 20 20s20-9 20-20S35 4 24 4"/><path fill="#0277BD" d="M45 24c0 11.7-9.5 21-21 21S3 35.7 3 24S12.3 3 24 3s21 9.3 21 21m-21.2 9.7c0-.4-.2-.6-.6-.8c-1.3-.4-2.5-.4-3.6-1.5c-.2-.4-.2-.8-.4-1.3c-.4-.4-1.5-.6-2.1-.8h-4.2c-.6-.2-1.1-1.1-1.5-1.7c0-.2 0-.6-.4-.6c-.4-.2-.8.2-1.3 0c-.2-.2-.2-.4-.2-.6c0-.6.4-1.3.8-1.7c.6-.4 1.3.2 1.9.2c.2 0 .2 0 .4.2c.6.2.8 1 .8 1.7v.4c0 .2.2.2.4.2c.2-1.1.2-2.1.4-3.2c0-1.3 1.3-2.5 2.3-2.9c.4-.2.6.2 1.1 0c1.3-.4 4.4-1.7 3.8-3.4c-.4-1.5-1.7-2.9-3.4-2.7c-.4.2-.6.4-1 .6c-.6.4-1.9 1.7-2.5 1.7c-1.1-.2-1.1-1.7-.8-2.3c.2-.8 2.1-3.6 3.4-3.1l.8.8c.4.2 1.1.2 1.7.2c.2 0 .4 0 .6-.2s.2-.2.2-.4c0-.6-.6-1.3-1-1.7s-1.1-.8-1.7-1.1c-2.1-.6-5.5.2-7.1 1.7s-2.9 4-3.8 6.1c-.4 1.3-.8 2.9-1 4.4c-.2 1-.4 1.9.2 2.9c.6 1.3 1.9 2.5 3.2 3.4c.8.6 2.5.6 3.4 1.7c.6.8.4 1.9.4 2.9c0 1.3.8 2.3 1.3 3.4c.2.6.4 1.5.6 2.1c0 .2.2 1.5.2 1.7c1.3.6 2.3 1.3 3.8 1.7c.2 0 1-1.3 1-1.5c.6-.6 1.1-1.5 1.7-1.9c.4-.2.8-.4 1.3-.8c.4-.4.6-1.3.8-1.9c.1-.5.3-1.3.1-1.9m.4-19.4c.2 0 .4-.2.8-.4c.6-.4 1.3-1.1 1.9-1.5s1.3-1.1 1.7-1.5c.6-.4 1.1-1.3 1.3-1.9c.2-.4.8-1.3.6-1.9c-.2-.4-1.3-.6-1.7-.8c-1.7-.4-3.1-.6-4.8-.6c-.6 0-1.5.2-1.7.8c-.2 1.1.6.8 1.5 1.1c0 0 .2 1.7.2 1.9c.2 1-.4 1.7-.4 2.7c0 .6 0 1.7.4 2.1zM41.8 29c.2-.4.2-1.1.4-1.5c.2-1 .2-2.1.2-3.1c0-2.1-.2-4.2-.8-6.1c-.4-.6-.6-1.3-.8-1.9c-.4-1.1-1-2.1-1.9-2.9c-.8-1.1-1.9-4-3.8-3.1c-.6.2-1 1-1.5 1.5c-.4.6-.8 1.3-1.3 1.9c-.2.2-.4.6-.2.8c0 .2.2.2.4.2c.4.2.6.2 1 .4c.2 0 .4.2.2.4c0 0 0 .2-.2.2c-1 1.1-2.1 1.9-3.1 2.9c-.2.2-.4.6-.4.8s.2.2.2.4s-.2.2-.4.4c-.4.2-.8.4-1.1.6c-.2.4 0 1.1-.2 1.5c-.2 1.1-.8 1.9-1.3 2.9c-.4.6-.6 1.3-1 1.9c0 .8-.2 1.5.2 2.1c1 1.5 2.9.6 4.4 1.3c.4.2.8.2 1.1.6c.6.6.6 1.7.8 2.3c.2.8.4 1.7.8 2.5c.2 1 .6 2.1.8 2.9c1.9-1.5 3.6-3.1 4.8-5.2c1.5-1.3 2.1-3 2.7-4.7"/>',
  },
  'like': {
    icon: 'like',
    meaning: 'Health, wellbeing, habits',
    body:
      '<path fill="#F44336" d="M34 9c-4.2 0-7.9 2.1-10 5.4C21.9 11.1 18.2 9 14 9C7.4 9 2 14.4 2 21c0 11.9 22 24 22 24s22-12 22-24c0-6.6-5.4-12-12-12"/>',
  },
} as const satisfies Record<string, AvatarProp>

export type AvatarPropId = keyof typeof AVATAR_PROPS

export const AVATAR_PROP_IDS = Object.keys(AVATAR_PROPS) as AvatarPropId[]

export const isAvatarPropId = (value: unknown): value is AvatarPropId =>
  typeof value === 'string' && value in AVATAR_PROPS

/**
 * Each glyph's dominant colour, area-weighted across its fills.
 *
 * Not decorative metadata: `getIdentity` reads it to keep a body hue at least
 * `MIN_PROP_HUE_SEPARATION` degrees away. Glyphs whose dominant fill is a neutral carry
 * `null` — a grey has no hue to collide with.
 */
export const PROP_HUE: Record<AvatarPropId, string | null> = {
  'search': '#BBDEFB',
  'binoculars': '#CE93D8',
  'inspection': '#455A64',
  'survey': '#455A64',
  'calendar': '#90A4AE',
  'alarm-clock': '#37474F',
  'todo-list': '#3F51B5',
  'manager': '#FF5722',
  'conference-call': '#455A64',
  'businessman': '#424242',
  'briefcase': '#424242',
  'command-line': '#76FF03',
  'deployment': '#37474F',
  'puzzle': '#8BC34A',
  'document': '#1976D2',
  'news': '#FF5722',
  'reading': '#5C6BC0',
  'graduation-cap': '#78909C',
  'calculator': '#E0E0E0',
  'currency-exchange': '#FFF59D',
  'bullish': '#4CAF50',
  'line-chart': '#3F51B5',
  'bar-chart': '#00BCD4',
  'advertising': '#90CAF9',
  'headset': '#37474F',
  'comments': '#8BC34A',
  'picture': '#F57C00',
  'music': '#E91E63',
  'film-reel': '#3F51B5',
  'idea': '#FFF59D',
  'signature': '#1565C0',
  'package': '#8A5100',
  'shop': '#7CB342',
  'home': '#FF8A65',
  'electricity': '#00BCD4',
  'privacy': '#424242',
  'key': '#D68600',
  'data-backup': '#D1C4E9',
  'globe': '#0277BD',
  'like': '#F44336',
}
