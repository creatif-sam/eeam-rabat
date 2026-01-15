// sendPushNotification.js
// Usage: node sendPushNotification.js

const webpush = require('web-push');
const fetch = require('node-fetch');

// VAPID keys
const VAPID_PUBLIC_KEY = 'BCJY-z4s-9SpgzjuYL3_KeiKt7HOEhYb7rPBCle3EFo1ch1A13j9j4AWr1Mp3VGiS_9tjji7cGDibDe8Xl5bGyQ';
const VAPID_PRIVATE_KEY = 'B795xZQfgOwzlylD2K5V6yQ_QWF2R5VgnWdsf-ovEDY';

webpush.setVapidDetails(
  'mailto:your@email.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// Supabase REST API details
const SUPABASE_URL = 'https://syrfwvjzxnwnnbrrzvkc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5cmZ3dmp6eG53bm5icnJ6dmtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1MjMyNzgsImV4cCI6MjA4MzA5OTI3OH0.o6Zd7F-NgtBaNSmElt446keBrXXJfduLrg3H4PfRaNE';

async function getSubscriptions() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    }
  });
  return res.json();
}

async function sendNotificationToAll() {
  const subscriptions = await getSubscriptions();
  for (const sub of subscriptions) {
    const subscription = {
      endpoint: sub.endpoint,
      keys: sub.keys
    };
    try {
      await webpush.sendNotification(
        subscription,
        JSON.stringify({
          title: 'EEAM Notification',
          body: 'You have a new message!',
          url: '/dashboard'
        })
      );
      console.log('Notification sent to:', sub.endpoint);
    } catch (err) {
      console.error('Error sending notification:', err);
    }
  }
}

sendNotificationToAll();
