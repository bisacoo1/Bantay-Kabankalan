# Bantay Kabankalan

A Next.js portal for reporting barangay issues and applying for and tracking permits. It uses Supabase Auth, Postgres, and Storage.

## Local setup

1. Use Node.js 22 or later and install dependencies: `npm ci`.
2. Create `.env.local` with your Supabase project's public API settings (do not commit this file):

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
   ```

3. Run [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL Editor. **Re-run it for existing installations**, too: it adds permit applicant fields and repairs the profile and staff access policies. The script is designed to be re-runnable; existing permits keep their data and have null values for newly added applicant fields. Run it with the project owner's SQL Editor permissions, not the anon key.
4. Start the app with `npm run dev` and visit `http://localhost:3000`.

New accounts are always citizens; the signup form cannot assign staff roles. Assign `officer` or `admin` roles to trusted accounts manually in Supabase with privileged access. If upgrading from the previous schema, audit existing non-citizen roles: old signups could request a role through user metadata. A citizen can only track permits submitted by their own account; staff can review permits for their assigned barangay in `/staff`.

## Checks

```bash
npm test
npm run lint
npm run build
```

The app can build without Supabase credentials, but signing in and using data-backed routes requires the environment variables and schema above.
