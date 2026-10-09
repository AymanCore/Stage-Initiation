# Connexion Supabase pour Tawsilex

Le site est hébergé sur GitHub Pages, donc il n’a pas de serveur privé. Supabase fournit ici la base PostgreSQL (SQL), l’API et les comptes de connexion des agents.

## Préparer le projet Supabase

Le projet Supabase est configuré. La table `shipments` a été créée et la désactivation des inscriptions publiques a été enregistrée.

Pour ajouter un compte agent, ouvre **Authentication > Users** dans Supabase et crée/invite l’adresse e-mail de l’agent. Le site utilise une connexion e-mail/mot de passe; les agents connectés peuvent lire et ajouter des expéditions, tandis que les visiteurs non connectés n’y ont pas accès.

Les paramètres du projet (URL et clé **Publishable**) se trouvent dans `supabase-config.js`. Vérifie les **Redirect URLs** d’Auth afin qu’elles incluent `https://aymancore.github.io/Stage-Initiation/`.

La clé Publishable est conçue pour être utilisée dans un site web. Les règles RLS protègent l’accès aux lignes. **Ne place jamais une clé Secret ou `service_role` dans le dépôt ou le navigateur.**

Si la configuration est vide, le site reste en mode démonstration et n’enregistre rien dans Supabase. Après configuration, la page demande une connexion agent, charge les 100 expéditions les plus récentes et enregistre les nouvelles dans PostgreSQL.
