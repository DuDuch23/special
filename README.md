# Site spécial 🌻💖

Petit site d'animations (tournesols, fleurs, Spider-Man, peluche, soleil)
en HTML/CSS/JS pur, sans dépendance externe, packagé dans une image Docker nginx.

## Non-indexation (SEO)

Le site est volontairement exclu des moteurs de recherche via :
- une balise `<meta name="robots" content="noindex, nofollow, noarchive">` dans `index.html`
- un header HTTP `X-Robots-Tag` renvoyé par nginx pour toutes les pages

Ces deux protections sont **au niveau du conteneur** : elles s'appliquent quelle que soit l'URL
utilisée pour y accéder (tunnel Cloudflare, IP, ou sous-dossier d'un domaine). Rien d'autre à
configurer si tu utilises le lien du tunnel Cloudflare ci-dessous — il n'est de toute façon jamais
lié à un domaine indexable.

Si tu déploies plutôt sous `alexandre-duchemin.fr/speciale` (voir plus bas), ajoute en plus
`Disallow: /speciale` au `robots.txt` racine de ton portfolio, par sécurité.

## Personnaliser le message

Le texte de la surprise se modifie dans [js/script.js](js/script.js), variable `MESSAGE` en haut du fichier.

## Tester en local (sans Docker)

Ouvre simplement `index.html` dans un navigateur, ou avec un petit serveur :

```bash
npx serve .
```

## Tester en local avec Docker

Par défaut le conteneur n'expose **aucun port** sur l'hôte (voir section Sécurité plus bas).
Pour tester en local, ouvre `docker-compose.yml` et décommente les deux lignes `ports:` /
`- "127.0.0.1:8091:8080"` du service `speciale`, puis :

```bash
docker compose up --build
```

Puis ouvre http://localhost:8091

## Sécurité

Le conteneur `speciale` n'est volontairement **pas exposé publiquement** :
- pas de `ports:` par défaut dans `docker-compose.yml` — seul `cloudflared` peut l'atteindre,
  via le réseau interne Docker (`http://speciale:8080`). Sans ça, n'importe qui scannant les
  ports du VPS serait tombé directement sur le site, en contournant le côté "lien secret" du tunnel.
- image nginx **non-root** (`nginxinc/nginx-unprivileged`), aucun besoin de privilèges pour
  démarrer
- `read_only: true` + `cap_drop: [ALL]` + `no-new-privileges` sur les deux services
- headers de sécurité HTTP dans `nginx.conf` : CSP stricte (`default-src 'self'`, aucune
  ressource externe autorisée), `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`,
  `Strict-Transport-Security`
- fichiers commençant par un point (`.env`, `.git`, ...) bloqués explicitement

Si le conteneur `cloudflared` refuse de démarrer à cause de `read_only: true` (selon la version
de l'image), retire simplement `read_only: true` et `tmpfs: [/tmp]` de ce service — ça n'a aucun
impact sur la sécurité du site lui-même, qui reste isolé côté `speciale`.

## Déployer sur le VPS avec un lien indépendant de ton domaine (recommandé)

`docker-compose.yml` inclut un service `cloudflared` qui ouvre un tunnel Cloudflare gratuit
vers le conteneur. Il génère une URL aléatoire en `https://xxxxx.trycloudflare.com`, sans
toucher à `alexandre-duchemin.fr` ni à ton DNS.

1. Sur le VPS :

   ```bash
   cd /data/speciale
   docker compose up -d --build
   ```

2. Récupère l'URL générée dans les logs du tunnel :

   ```bash
   docker compose logs cloudflared | grep trycloudflare.com
   ```

   Tu verras une ligne du type `https://mot-aleatoire-ici.trycloudflare.com` — c'est le lien à
   partager.

3. Le tunnel reste actif tant que le conteneur tourne (`restart: unless-stopped`), mais l'URL
   **change à chaque redémarrage** du conteneur `cloudflared`. Évite donc de le relancer une fois
   le lien partagé.

## Alternative : déployer sous `alexandre-duchemin.fr/speciale`

1. Copie tout le dossier sur le VPS (ex : `/opt/speciale`).
2. Lance le conteneur :

   ```bash
   cd /opt/speciale
   docker compose up -d --build
   ```

   Décommente d'abord les lignes `ports:` / `- "127.0.0.1:8091:8080"` dans `docker-compose.yml`
   (nécessaires ici puisque le reverse proxy doit atteindre le conteneur depuis l'hôte).
   Le site tourne alors sur `127.0.0.1:8091`.

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
