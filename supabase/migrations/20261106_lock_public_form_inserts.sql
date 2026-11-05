-- =====================================================================
-- Turnstile : empêcher de contourner la vérification anti-robot
--
-- Les formulaires publics passent désormais par des actions serveur qui
-- vérifient Turnstile puis insèrent avec la clé service_role. Ce script
-- retire le droit d'INSERT direct au rôle « anon » (clé publique), pour
-- qu'un robot ne puisse plus écrire en appelant Supabase directement.
--
-- ⚠ À exécuter UNIQUEMENT après avoir ajouté SUPABASE_SERVICE_ROLE_KEY
--   dans les variables d'environnement Vercel et redéployé ; sinon les
--   formulaires publics ne pourront plus enregistrer.
--
-- Les utilisateurs connectés (rôle « authenticated », tableau de bord)
-- ne sont pas concernés.
-- =====================================================================

revoke insert on table public.member_registrations from anon;
revoke insert on table public.volunteer_requests   from anon;
revoke insert on table public.group_join_requests  from anon;
revoke insert on table public.prayer_requests      from anon;
revoke insert on table public.commission_requests  from anon;
revoke insert on table public.attendance_records   from anon;

-- pastoral_counselling n'est pas verrouillée ici : la réservation passe par
-- la fonction book_counselling_slot(). Si cette fonction est SECURITY DEFINER,
-- vous pouvez aussi exécuter :
--   revoke insert on table public.pastoral_counselling from anon;

-- Pour annuler :
--   grant insert on table public.<table> to anon;
