# Restoring the backend

The original endpoint (`onztbdqrldlmoezcqusq.supabase.co`) no longer has a DNS record, so it cannot serve authentication or data requests.

1. Create or restore a Supabase project.
2. In the project's SQL Editor, run both files in `supabase/migrations/` in filename order.
3. In Project Settings > API, copy the Project URL and anon/public key into `.env` using `.env.example` as the template.
4. In Authentication > URL Configuration, add `http://localhost:5173` as a redirect URL. Configure email confirmation to match your preferred signup flow.
5. Deploy the AI edge function: `supabase functions deploy visiondiab-ai`.
6. Run `npm run dev`, then open `http://localhost:5173`.

The signup code now sends the name and role in user metadata; the added database trigger creates the profile safely on the server.
