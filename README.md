# Jovian Clicker — Sonions™

## Play
Unzip the entire `Jovian_Clicker_Project` folder, then double-click `index.html` to open the game in a desktop browser. Keep the `css`, `js`, and `assets` folders next to the HTML file.

## Contents
- `index.html` — landing page, creators CVs, game layout and markup.
- `css/styles.css` — game appearance, layouts, and animated transitions.
- `js/game.js` — warp animations, clicker game logic, upgrade shop, and local save data.
- `assets/jovian-clicker.jpg` — square formatted version displayed in the game.
- `assets/jovian-original.jpg` — original uploaded Jovian image.
- `assets/audio-1.mp3` — your soundtrack for the main menu and Creators page (loops).
- `assets/audio-2.mp3` — your soundtrack for Jovian Clicker gameplay (loops).

## Notes
- Nickname, balance and permanent upgrades are stored in the browser's localStorage (not on a server). Some restrictive browser privacy settings might prevent local saving when opening files directly; in that case run the folder on a local web server.
- The landing page's original black-hole video is linked to an external HTTPS address, so it requires internet access. The site has a CSS fallback background if the video is unavailable.
- Google Fonts also require internet access; the game uses fallback fonts when offline.

## Audio and updated title
- The main title reads **Jovian Clicker** (no trailing period).
- A semitransparent black backdrop beneath the title fades smoothly to 100% transparency beyond the text's area.
- Audio transitions crossfade when entering or leaving gameplay; menu and Creators share Audio 1.
- Use the **♫ Music** button in the header to enable or mute background music. Browsers usually prohibit audible autoplay until you click or press a key; music automatically starts at the first eligible interaction.
- Audio files are stored locally with the code. No internet is required for music, but the existing hero background video and Google Font still use their original remote URLs.
