# Tasha Enterprises: putting the shop and admin online

There are two parts:

- **The shop**: `yoursite/`, what customers see.
- **The admin**: `yoursite/admin`, where the shop owner sees every product, edits text and photos, adds new products and marks things sold out.

Everything is free. Setup takes about 20 minutes and is done once.

---

## Part 1: One-time setup (for whoever is setting up the site)

### 1. Make a GitHub account for the shop

GitHub is where the site's files live. Every change made in the admin is saved there as a new version, so nothing is ever lost.

1. Go to github.com and sign up with the shop's email address, for example a username like `tasha-enterprises`.
2. Use this account for everything below. Both of you can sign in to it. The admin login in Part 2 only works with the account that owns the files.

### 2. Upload the files

1. Signed in to the shop account, click **+** (top right), then **New repository**.
2. Name it `tasha-website`, choose **Private**, and click **Create repository**.
3. On the next page click **uploading an existing file**.
4. Open this folder on your computer, select **everything inside it** (not the folder itself), and drag it onto the page.
5. Click **Commit changes**.

### 3. Tell the admin where the files are

1. In the repository on GitHub, open `admin`, then `config.yml`, and click the pencil icon to edit.
2. Change this line:
   `repo: YOUR-GITHUB-USERNAME/tasha-website`
   to the real account name, for example:
   `repo: tasha-enterprises/tasha-website`
3. Click **Commit changes**.

### 4. Put it online with Cloudflare

1. Sign up at dash.cloudflare.com (free).
2. Go to **Workers & Pages**, click **Create**, choose **Pages**, then **Connect to Git**.
3. Connect the shop's GitHub account and pick `tasha-website`.
4. Fill in the build settings:
   - Framework preset: **None**
   - Build command: `node build.mjs`
   - Build output directory: `_site`
5. Click **Save and Deploy**. After a minute you get a link like `tasha-website.pages.dev`. That's the live shop.

Cloudflare sometimes changes its dashboard. If your screens look different, look for "deploy from a GitHub repository" and enter the same build command and output directory.

**Your own web address (optional):** buy a domain such as `tashaenterprises.in`, then in Cloudflare open the project and go to **Custom domains**.

---

## Part 2: Signing in to the admin (once per phone or computer)

1. Open `tasha-website.pages.dev/admin`, using your real link.
2. Tap **Sign In with Token**.
3. A GitHub page opens with the right permissions already filled in. Make sure you're signed in to the **shop's** GitHub account. Then:
   - **Repository access**: choose **Only select repositories** and pick `tasha-website`.
   - **Expiration**: pick the longest option offered.
   - Click **Generate token** and copy the long code it shows.
4. Go back to the admin, paste the code, and you're in.

The phone or computer stays signed in. When the token expires, the admin asks you to sign in again; repeat these steps.

Keep the token private, like a password. It lets someone change the website, but nothing else.

---

## Part 3: Using the admin (for the shop owner)

Every change goes live about **1 to 2 minutes** after you press **Save**.

| To do this | Do this |
|---|---|
| Change a price, name or description | **Products**, tap the product, make your change, then **Save** |
| Add or change a photo | Open the product, go to **Photo**, then **Browse** and pick a photo from your phone, then **Save**. Big photos are shrunk automatically. |
| Add a new product | **Products**, then **New**. Fill it in and **Save**. |
| Mark something sold out | Open the product, switch off **In stock**, then **Save**. Customers see "Sold out · ask us", which opens WhatsApp. |
| Remove a product for good | Open the product, tap the **⋮** menu, then **Delete**. If it'll be back next season, switch off In stock instead. |
| Change the WhatsApp number or section descriptions | **Shop settings**, then **Contact details and sections** |
| Find something quickly | Use the search bar, or group the list by **Section** |

**Tips**

- **Order within a section:** lower **Position in section** numbers show first.
- **Wording:** describe how people use a product and why they like it. Avoid medical promises like "cures" or "boosts immunity".
- **Mistakes:** every save is kept as a version on GitHub, so ask whoever set up the site to restore an older one.

---

## For developers

- Products: one file each in `content/products/*.json`
- Contact details and sections: `content/settings.json`
- `node build.mjs` combines them into `_site/data/shop.json` and copies the site into `_site/`. No packages are needed.
- To preview locally: run `node build.mjs`, then `cd _site && python3 -m http.server 8000`, and open http://localhost:8000.
- Admin: Sveltia CMS, configured in `admin/config.yml`. Photos go to `images/products/`.
- **Adding a new section:** add it in `content/settings.json` (pick an `art` style: jar, bowl, nuts, jam, cup, spice, stick or textile) and add the same `id` to the Section options in `admin/config.yml`.
