# Harsha Vardhini S — Portfolio

A single-page, zero-dependency portfolio site. No build step, no framework, no npm install.

## Run it

Double-click `index.html`, or serve it locally (recommended, so scroll behaviour and fonts behave normally):

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>.

## Deploy

Static files only — push the folder to GitHub Pages, Netlify, Vercel, Cloudflare Pages or any static host. There is nothing to compile.

## Structure

```
index.html          all markup and copy
assets/styles.css   design tokens, layout, responsive rules, animations
assets/script.js    reveals, filters, accordion, counters, nav, mobile menu
assets/portrait.jpg hero portrait
```

## Editing content

Everything you will want to change lives in `index.html` as plain text:

| What | Where |
| --- | --- |
| Name, email, phone, GitHub, LinkedIn | hero aside, contact section, `menu` footer |
| Hero intro and the Focus/Method/Also-into rows | `section.hero` |
| Stat numbers (03 / 07 / 50K+ / 200+) | `section.hero .hero__stats` — `data-count`, `data-pad`, `data-suffix` |
| Marquee keywords | `words` array in `assets/script.js` |
| Projects | `section.work #workGrid` — `data-kind` must match a filter id |
| Filter tabs and their counts | `ul.filters` in `section.work` (update the `<sup>` counts by hand) |
| Capability accordion | `div#acc` |
| Experience | `div.tl` |
| Profile copy | `section.about` |
| Education, toolkit, certifications, interests | `section.cred` |
| Year in the footer | auto-filled from the current date by script |

## Colours

All colour lives in `:root` at the top of `assets/styles.css`:

```css
--paper:   #f4f2ed   page background
--paper-2: #ebe8e1   alternating section background
--ink:     #14110f   text, dark sections
--accent:  #b4552d   terracotta accent
--line:    #ded9d0   hairlines
```

Change `--accent` to re-tint the whole site.

## Notes

- Fonts load from Google Fonts (Instrument Serif, Inter, JetBrains Mono) and fall back to system serif/sans/mono if offline.
- `assets/portrait.jpg` is displayed in greyscale and goes full colour on hover.
- Honours `prefers-reduced-motion`: reveals, morphing portrait, marquee and counters all stand down.
- Project cards without a live link show a dimmed arrow and are not clickable.
