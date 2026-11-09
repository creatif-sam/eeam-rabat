# E-mails Supabase en français

Supabase envoie lui-même les e-mails de confirmation d'inscription et de réinitialisation du mot de passe. Par défaut ils sont en anglais.

**Où les modifier :** Supabase → Authentication → Emails → Templates.

Ces modèles utilisent le lien `token_hash`, géré par `/auth/confirm`. Ce lien fonctionne même si l'e-mail est ouvert sur un autre appareil que celui de l'inscription.

Vérifiez aussi que **Site URL** (Authentication → URL Configuration) est l'adresse de production du site.

---

## Confirm signup

> Plus utilisé : l'inscription publique est supprimée. Les comptes sont créés par un administrateur (Utilisateurs → « Donner un accès ») avec une adresse déjà confirmée. Gardez « Allow new users to sign up » désactivé dans Supabase (Authentication → Sign In / Providers).

**Objet :** `Confirmez votre inscription – EEAM Rabat`

```html
<div style="max-width:560px;margin:0 auto;padding:32px 16px;font-family:Roboto,Segoe UI,Arial,sans-serif;color:#1f2937;background:#f4f6fb">
  <div style="background:#e11d48;color:#fff;border-radius:14px 14px 0 0;padding:18px 24px;font-weight:700;font-size:18px">EEAM Rabat</div>
  <div style="background:#fff;border-radius:0 0 14px 14px;padding:24px;border:1px solid #e5e7eb;border-top:0">
    <h1 style="font-size:20px;margin:0 0 16px">Bienvenue !</h1>
    <p>Merci de vous être inscrit sur l'intranet de l'EEAM Rabat. Confirmez votre adresse e-mail pour continuer :</p>
    <p style="margin:28px 0">
      <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/profile/setup"
         style="background:#0891b2;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600;display:inline-block">
        Confirmer mon adresse
      </a>
    </p>
    <p style="font-size:13px;color:#6b7280">Après confirmation, un administrateur ou un pasteur validera votre accès.</p>
    <p style="font-size:13px;color:#6b7280">Si vous n'êtes pas à l'origine de cette inscription, ignorez cet e-mail.</p>
  </div>
</div>
```

## Reset password

**Objet :** `Réinitialisation de votre mot de passe – EEAM Rabat`

```html
<div style="max-width:560px;margin:0 auto;padding:32px 16px;font-family:Roboto,Segoe UI,Arial,sans-serif;color:#1f2937;background:#f4f6fb">
  <div style="background:#e11d48;color:#fff;border-radius:14px 14px 0 0;padding:18px 24px;font-weight:700;font-size:18px">EEAM Rabat</div>
  <div style="background:#fff;border-radius:0 0 14px 14px;padding:24px;border:1px solid #e5e7eb;border-top:0">
    <h1 style="font-size:20px;margin:0 0 16px">Mot de passe oublié ?</h1>
    <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour en choisir un nouveau :</p>
    <p style="margin:28px 0">
      <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/auth/update-password"
         style="background:#0891b2;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600;display:inline-block">
        Choisir un nouveau mot de passe
      </a>
    </p>
    <p style="font-size:13px;color:#6b7280">Ce lien expire rapidement. Si vous n'avez rien demandé, ignorez cet e-mail.</p>
  </div>
</div>
```
