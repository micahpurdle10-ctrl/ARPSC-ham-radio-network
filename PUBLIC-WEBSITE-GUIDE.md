# ARPSC Public Website Address Guide

Use this when you want people to open your app from anywhere using a website URL, without needing your local IP or same Wi-Fi.

Preferred domain target: `https://arpschamradio.com`

Note: Domain names cannot contain spaces. Use `arpschamradio.com` for "ARPSC ham radio.com".

## Quick Start

1. Run `OPEN-PUBLIC-NOW.bat` from `c:\Users\mpurd\New folder`.
2. The launcher starts your ARPSC server on `http://127.0.0.1:8080`.
3. It then starts a tunnel and prints a public URL:
   - Cloudflare: `https://...trycloudflare.com` (preferred)
   - Fallback: `https://...loca.lt`
4. Share that URL with users.

## Custom Domain (arpschamradio.com)

1. Run `OPEN-ARPSCHAMRADIO-NOW.bat` from `c:\Users\mpurd\New folder`.
2. If custom domain tunnel is configured, users will access:
   - `https://arpschamradio.com`
3. If custom domain is not configured yet, the launcher falls back to a temporary URL.

See `ARPSC-CUSTOM-DOMAIN-SETUP.md` for one-time setup.

## Important

- Keep the server window open.
- Keep the tunnel window open.
- If either window closes, the public URL stops working.

## Recommended Install (for best results)

Install Cloudflare Tunnel once:

```powershell
winget install Cloudflare.cloudflared
```

After install, rerun `OPEN-PUBLIC-NOW.bat`.

## Notes

- The URL may change each time you start a quick tunnel.
- For a permanent custom domain, complete the setup in `ARPSC-CUSTOM-DOMAIN-SETUP.md`.
