# Site spécial 🌻💖

Petit site d'animations (tournesols, fleurs, Spider-Man, peluche, soleil)
en HTML/CSS/JS pur, sans dépendance externe, packagé dans une image Docker nginx.

## Non-indexation (SEO)

Le site est volontairement exclu des moteurs de recherche via :
- une balise `<meta name="robots" content="noindex, nofollow, noarchive">` dans `index.html`
- un header HTTP `X-Robots-Tag` renvoyé par nginx pour toutes les pages

⚠️ Le `robots.txt` du conteneur (`/speciale/robots.txt`) n'est **pas** celui que Google regarde :
les crawlers vérifient `https://alexandre-duchemin.fr/robots.txt` (la racine du domaine), qui est
géré par ton site principal, pas par ce conteneur. Si tu veux une protection complète, ajoute cette
ligne dans le `robots.txt` racine de `alexandre-duchemin.fr` :

```
Disallow: /speciale
```

La balise meta + le header restent la protection principale et suffisent dans la plupart des cas
(ils empêchent l'indexation même si la page est crawlée).

## Personnaliser le message

Le texte de la surprise se modifie dans [js/script.js](js/script.js), variable `MESSAGE` en haut du fichier.

## Tester en local (sans Docker)

Ouvre simplement `index.html` dans un navigateur, ou avec un petit serveur :

```bash
npx serve .
```

## Tester en local avec Docker

```bash
docker compose up --build
```

Puis ouvre http://localhost:8091

## Déployer sur le VPS à `alexandre-duchemin.fr/speciale`

1. Copie tout le dossier sur le VPS (ex : `/opt/speciale`).
2. Lance le conteneur :

   ```bash
   cd /opt/speciale
   docker compose up -d --build
   ```

   Le site tourne alors sur `127.0.0.1:8091` dans le conteneur.

3. Configure ton reverse proxy existant pour rediriger `/speciale` vers ce port.
   Le site utilise des chemins **relatifs** (`css/style.css`, `js/script.js`), donc il
   fonctionne tel quel sous un sous-dossier — mais l'URL doit se terminer par un `/`.

   **Exemple Nginx** (bloc à ajouter dans le `server { }` existant du domaine) :

   ```nginx
   location = /speciale {
       return 301 /speciale/;
   }

   location /speciale/ {
       proxy_pass http://127.0.0.1:8091/;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
   }
   ```

   **Exemple Caddy** :

   ```caddyfile
   handle_path /speciale/* {
       reverse_proxy 127.0.0.1:8091
   }
   ```

   **Exemple Traefik** (labels docker-compose, si tu utilises déjà Traefik) :

   ```yaml
   labels:
     - "traefik.enable=true"
     - "traefik.http.routers.speciale.rule=Host(`alexandre-duchemin.fr`) && PathPrefix(`/speciale`)"
     - "traefik.http.middlewares.speciale-strip.stripprefix.prefixes=/speciale"
     - "traefik.http.routers.speciale.middlewares=speciale-strip"
     - "traefik.http.services.speciale.loadbalancer.server.port=80"
   ```

4. Recharge la config du reverse proxy (`nginx -s reload` ou équivalent), puis va sur
   `https://alexandre-duchemin.fr/speciale/`.

## Structure

```
index.html        page principale
css/style.css      toutes les animations
js/script.js       interactions (peluche à glisser, confettis, message surprise)
Dockerfile          image nginx alpine
nginx.conf          config nginx interne au conteneur
docker-compose.yml   lancement local / VPS
```
