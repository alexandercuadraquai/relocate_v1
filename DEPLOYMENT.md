# Deployment Instructions — RelocatePanama

## Option A: Deploy to Hostinger

### Via File Manager (Easiest)
1. Log in to [hpanel.hostinger.com](https://hpanel.hostinger.com)
2. Go to **Files → File Manager**
3. Navigate to `public_html` folder
4. **Delete** or backup existing files
5. Upload these files:
   - `index.html`
   - `styles.css`
   - `script.js`
   - `images/` folder (with `logo.png` and `hero-bg.png`)
6. Your site is live at your domain!

### Via FTP
1. In Hostinger hPanel: **Files → FTP Accounts**, get credentials
2. Use FileZilla or any FTP client:
   - **Host:** ftp.relocatepa.com (or your server IP)
   - **Username / Password:** from hPanel
   - **Port:** 21
3. Upload all files to `/public_html/`

---

## Option B: Migrate to Cloudflare Pages

### Steps
1. Push files to a GitHub/GitLab repository
2. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
3. Navigate to **Workers & Pages → Create → Pages**
4. Connect your Git repository
5. Build settings:
   - **Build command:** (leave empty — static site)
   - **Build output directory:** `/` (root)
6. Deploy!

### Update DNS (if moving from Hostinger)
1. In Cloudflare: **Add site → relocatepa.com**
2. Cloudflare will give you 2 nameservers (e.g. `aria.ns.cloudflare.com`)
3. In Hostinger hPanel: **Domain → DNS/Nameservers**
4. Replace Hostinger nameservers with Cloudflare ones
5. Wait 24-48h for DNS propagation

### Alternative: Direct Upload (No Git needed)
1. Cloudflare Dashboard → **Pages → Create → Direct Upload**
2. Drag & drop your project folder
3. Done in seconds!

---

## File Structure to Upload
```
/
├── index.html
├── styles.css
├── script.js
└── images/
    ├── logo.png
    └── hero-bg.png
```
