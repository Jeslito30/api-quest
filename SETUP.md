# Clerk + Supabase Setup Guide

## 1. Install new dependencies

```bash
npx expo install @clerk/clerk-expo expo-secure-store expo-web-browser expo-linking
```

Remove the old Supabase auth dependency (no longer needed):
```bash
# @supabase/supabase-js stays — it's still used for the database
# You can remove @react-native-async-storage/async-storage if nothing else uses it
```

---

## 2. Configure Clerk

1. Go to [https://dashboard.clerk.com](https://dashboard.clerk.com) and create a new app
2. Enable **Google** as a social provider under **User & Authentication → Social Connections**
3. Copy your **Publishable Key** from **API Keys**
4. Add it to your `.env` file:

```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxx
```

### Expo / deep link redirect (required for Google OAuth on native)

In your Clerk dashboard → **Paths** → **Sign-in redirect URL**, add:
```
your-scheme://
```
Where `your-scheme` matches the `scheme` field in your `app.json` (e.g. `apiquest://`).

---

## 3. Configure Supabase (database only)

1. Go to [https://supabase.com](https://supabase.com) → your project → **SQL Editor**
2. Paste and run the contents of `supabase-setup.sql`

### Optional: Clerk JWT integration for Row-Level Security

To enable proper RLS so users can only read their own rows:

1. In Clerk dashboard → **JWT Templates** → **New template** → choose **Supabase**
2. Copy the signing key
3. In Supabase → **Auth** → **JWT Settings** → paste the Clerk signing key

If you skip this step, RLS will block all queries. Either:
- Complete the JWT setup above (recommended for production), or  
- In Supabase SQL Editor, drop the RLS policy and rely on `clerk_user_id` filtering:
  ```sql
  drop policy "Users manage their own history" on prompt_history;
  ```

---

## 4. Save history in your screens

Call `saveToHistory` after any successful API call. Example in `index.tsx`:

```js
import { saveToHistory } from '@/services/history';
import { useAuth } from '@/context/AuthContext';

const { userId } = useAuth();

// After a successful chat response:
await saveToHistory(userId, 'chat', userPrompt, aiResponse);

// After generating an image:
await saveToHistory(userId, 'image', userPrompt, imageUrl);

// After generating slides (pass the JSON object — it'll be stringified):
await saveToHistory(userId, 'slides', topic, slidesData);
```

---

## 5. .env file

Copy `.env.example` to `.env` and fill in all your keys:

```bash
cp .env.example .env
```

---

## Architecture summary

```
Clerk          → handles all authentication (Google OAuth + email/password)
Supabase       → database only (prompt_history table)
AuthContext    → thin wrapper around Clerk hooks, exposes user + userId + signOut
history.js     → all Supabase DB operations (save / fetch / delete / clear)
ChatContext    → in-memory conversations for the current session
```
