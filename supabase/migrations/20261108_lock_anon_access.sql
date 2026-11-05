-- =====================================================================
-- Fermer la base aux visiteurs anonymes (clé publique « anon »)
--
-- Le tableau de bord interroge désormais Supabase en tant qu'utilisateur
-- connecté, et les formulaires publics passent par le serveur (clé
-- service_role). Le rôle « anon » n'a donc plus besoin que de LIRE ce que
-- le site public affiche.
--
-- ⚠ À exécuter APRÈS le déploiement de cette version du site.
-- Ré-exécutable.
-- =====================================================================

begin;

-- 1) Retirer tous les droits anonymes sur les tables et vues existantes
revoke all on all tables in schema public from anon;

-- 2) …et sur celles qui seront créées plus tard
alter default privileges in schema public revoke all on tables from anon;

-- 3) Lecture publique uniquement de ce qu'affiche le site
grant select on table
  public.events,               -- calendrier et événements
  public.groupes_commissions,  -- liste des commissions (formulaire « Rejoindre »)
  public.pastors,              -- choix du pasteur (entretien pastoral)
  public.service_types,        -- types de culte (formulaire d'assiduité)
  public.site_settings,        -- thème de l'année
  public.site_announcements    -- bandeau d'annonces (filtré par RLS)
to anon;

commit;

-- Vérification : tables encore lisibles par anon (doit lister les 6 ci-dessus)
select table_name, string_agg(privilege_type, ', ') as droits
from information_schema.role_table_grants
where grantee = 'anon' and table_schema = 'public'
group by table_name
order by table_name;

-- Pour annuler (revenir à l'ancien comportement, déconseillé) :
--   grant select, insert, update, delete on all tables in schema public to anon;
