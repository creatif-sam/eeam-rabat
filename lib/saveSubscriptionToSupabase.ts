// Utility to save push subscription to Supabase
export async function saveSubscriptionToSupabase(subscription) {
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
