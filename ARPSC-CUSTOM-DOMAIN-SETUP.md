# ARPSC Custom Domain Setup (`arpschamradio.com`)

This makes your site open as:

`https://arpschamradio.com`

## Important

A domain cannot include spaces, so `ARPSC ham radio.com` must be registered as `arpschamradio.com`.

## One-Time Setup

1. Register the domain `arpschamradio.com` with any registrar.
2. Add the domain to Cloudflare DNS.
3. Install cloudflared:

```powershell
winget install Cloudflare.cloudflared
```

4. Login cloudflared:

```powershell
cloudflared tunnel login
```

5. Create tunnel:

```powershell
cloudflared tunnel create arpsc-ham-radio
```

6. Route domain to tunnel:

```powershell
cloudflared tunnel route dns arpsc-ham-radio arpschamradio.com
```

7. Update `cloudflared-domain.yml` with your real tunnel UUID and credentials file path.

## Run It

1. Set your tunnel token once (optional but recommended):

```powershell
setx ARPSC_CF_TUNNEL_TOKEN "YOUR_TUNNEL_TOKEN"
```

2. Run:

`OPEN-PUBLIC-NOW.bat`

The launcher will use named-domain mode first, then fallback to random URLs if needed.

## Result

Once DNS has propagated and the tunnel is running, users can open:

`https://arpschamradio.com`
