# EEAM Rabat – eLead

Site public et intranet de l'Église Évangélique Au Maroc – paroisse de Rabat.

- **Site public** : accueil, calendrier des événements, formulaires (membre, bénévolat, prière, commissions, assiduité), prise de rendez-vous pastoral.
- **Intranet** (`/dashboard`) : membres, commissions, événements, baptêmes, formations, finances, logistique, rapports, ressources, gestion des utilisateurs et traitement des formulaires.

## Stack

Next.js 16 (App Router) · Supabase (Auth + Postgres) · Material UI (tableau de bord) · Tailwind CSS (site public) · Resend (e-mails) · WhatsApp Cloud API.

## Démarrage local

```bash
npm install
npm run dev
```

Créer un fichier `.env.local` :

| Variable | Rôle |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé serveur : création des accès, mots de passe temporaires, suppression de comptes, notifications — ne jamais exposer côté client |
| `RESEND_API_KEY` | Envoi des e-mails |
| `NEXT_PUBLIC_SITE_URL` | URL de production, utilisée dans les liens des e-mails |
| `ADMIN_ALERT_EMAILS` | (optionnel) destinataires supplémentaires des alertes, séparés par des virgules |
| `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` | Confirmations WhatsApp des entretiens pastoraux |
| `PUBLIC_FORMS_ACCESS_CODE` | Code d'accès des formulaires publics |
| `NEXT_PUBLIC_APP_VERSION` | Version (cache du service worker) |

## Données

- `docs/planning-paroissial-2026-2027.md` : le planning paroissial 2026-2027 (déjà importé dans le calendrier).
- `docs/supabase-emails-fr.md` : modèles d'e-mails Supabase en français (confirmation d'inscription, mot de passe oublié).
