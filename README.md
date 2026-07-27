# Flowstate — waitlist site

Plain HTML/CSS/JS, no build step. Deploys straight to Cloudflare Pages.

## Deploying

1. Push this folder to its own GitHub repo (or a `website/` folder in your org).
2. In Cloudflare Pages → Create a project → connect the repo.
3. Build settings: leave the build command **empty** and set the output
   directory to `/` (root) — there's nothing to build.
4. Deploy.
5. Add your custom domain under the Pages project's **Custom domains** tab.

## Wiring up the waitlist form

The form POSTs to `/subscribe`, handled by `functions/subscribe.ts` — a
Cloudflare Pages Function that forwards signups to EmailOctopus server-side.

1. Create a list in EmailOctopus, grab its **List ID** and your **API key**.
2. In the Cloudflare Pages dashboard → your project → **Settings →
   Environment variables**, add:
   - `EMAILOCTOPUS_API_KEY`
   - `EMAILOCTOPUS_LIST_ID`
3. Redeploy — environment variables only take effect on new deployments,
   not retroactively.
4. Double check the request field names in `functions/subscribe.ts` against
   EmailOctopus's current API docs before relying on it — it's written
   against their general v2 shape but hasn't been tested against a live key.

## Still needed

- `assets/og-image.png` — a real Open Graph share image (referenced in
  `index.html`'s meta tags but not yet created). Without it, links shared on
  social/Discord/TikTok won't show a preview image.
- Real Privacy and Contact destinations (footer links are placeholders).