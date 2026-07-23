# My extension stash

This is a collection of extensions that I use to make my life easier.

## Prerequisits

`npm i`

## How to use them

1. `npm run build:dev`
2. Go to [Chrome extensions](chrome://extensions)
3. Enable dev tools
4. Click load unpacked
5. Select `extension/<extension_name>`

### Font checker

Load `extensions/font-checker`, then use the extension popup to enable or disable
the floating checker and save a case-insensitive font substring. The default
`Neue` also matches fonts such as `Neue Plak`.

Open Chrome DevTools and select the **Font Checker** tab to see the latest scan
status and every element highlighted by the floating checker.

## How to pack the extensions (zip file)

1. `npm run bundle:extension`
2. Follow the wizard

or 

1. `npm run bundle:extension -- all` to bundle all extensions
