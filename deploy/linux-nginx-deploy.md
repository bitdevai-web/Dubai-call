# Linux Nginx Deployment

## Step 1: Create Environment Variables on Server

**Critical:** Create `.env.local` on the server with your ElevenLabs credentials:

```bash
cd /path/to/dubai-call
nano .env.local
```

Add these lines:
```
VITE_ELEVENLABS_API_KEY=sk_xxx_your_key_here
VITE_ELEVENLABS_VOICE_ID=your_voice_id_here
```

Save and exit (Ctrl+X, Y, Enter).

## Step 2: Build the app locally or on the server:

```bash
npm install
npm run build
```

Upload the project or at minimum the `dist/` folder to the server, then place the built files here:

```bash
/var/www/dubai-call/dist
```

Copy the Nginx config into sites-available:

```bash
sudo cp deploy/nginx-dubai-call.conf /etc/nginx/sites-available/dubai-call.conf
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/dubai-call.conf /etc/nginx/sites-enabled/dubai-call.conf
```

Test and reload Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

If you want a domain, replace `server_name _;` in `deploy/nginx-dubai-call.conf` with your real domain.

If SSL is needed, add Certbot after the site is live:

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```