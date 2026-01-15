# Generate VAPID Keys

You need VAPID keys for secure push notifications. Run this in your terminal:

npm install web-push -g
web-push generate-vapid-keys

This will output a public and private key. Use the public key in your frontend and store the private key for your backend.

# Supabase Table Schema

Create a table in Supabase called `push_subscriptions`:

- id: uuid (primary key)
- user_id: uuid (reference to your users table, optional)
- endpoint: text
- keys: jsonb
- created_at: timestamp

# Frontend: Send Subscription to Supabase

Add this function to your frontend (e.g., in a utility file):

async function saveSubscriptionToSupabase(subscription) {
  await fetch('https://<YOUR_SUPABASE_PROJECT>.supabase.co/rest/v1/push_subscriptions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': '<YOUR_SUPABASE_ANON_KEY>',
      'Authorization': 'Bearer <YOUR_SUPABASE_ANON_KEY>'
    },
    body: JSON.stringify({
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      created_at: new Date().toISOString()
    })
  });
}

Call this function after subscribing the user in layout.tsx.

# Backend: Send Push Notification

Install web-push:

npm install web-push

Example Node.js code:

const webpush = require('web-push');
webpush.setVapidDetails(
  'mailto:your@email.com',
  '<YOUR_PUBLIC_VAPID_KEY>',
  '<YOUR_PRIVATE_VAPID_KEY>'
);

// subscription = { endpoint, keys: { p256dh, auth } }
webpush.sendNotification(subscription, JSON.stringify({
  title: 'EEAM Notification',
  body: 'You have a new message!',
  url: '/dashboard'
}));

# Next Steps
- Generate VAPID keys and update layout.tsx with your public key.
- Create the Supabase table.
- Add the saveSubscriptionToSupabase function and call it after subscribing.
- Use the backend code to send notifications.

Let me know if you want me to add the frontend code for saving subscriptions automatically!