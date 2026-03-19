# V3 Tropical Rebranding Deployment

## Deployment for `relocate_v3_html` (Easiest)
This folder contains the pure HTML/CSS/JS version of the new V3 Tropical Light design.

1. Go to [Hostinger hPanel](https://hpanel.hostinger.com)
2. Open **File Manager** -> go to `public_html`
3. Upload all the contents of the `relocate_v3_html` folder (`index.html`, `styles.css`, `script.js`, and the `images/` directory).
4. Done!

## Deployment for `relocate_v3_astro` (Best for Performance)
This folder contains the Astro version of the new V3 design. You must build it before uploading, or connect it to Cloudflare Pages.

### Option A: Cloudflare Pages (Recommended & Free)
1. Upload the `relocate_v3_astro` folder to a GitHub repository.
2. In Cloudflare Dashboard, go to **Pages -> Create -> Connect to Git**.
3. Select your repository.
4. Set the **Framework preset** to `Astro`.
5. Cloudflare will automatically build and deploy it perfectly!

### Option B: Manual Hostinger Upload
1. First, you must run the build command inside the `relocate_v3_astro` folder: `npm run build`
2. This creates a new folder called `dist/`.
3. Open Hostinger File Manager -> `public_html`.
4. Upload **only** the contents of the `dist/` folder to Hostinger.
5. Done!
