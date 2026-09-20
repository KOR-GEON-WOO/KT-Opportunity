# KT Sales Agent 배포 메모

## 빌드

```bash
npm install
npm run build
```

## Nginx에 반영

```bash
sudo rm -rf /var/www/kt-sales-agent/*
sudo cp -r dist/. /var/www/kt-sales-agent/
sudo nginx -t
sudo systemctl reload nginx
```

`deploy/nginx/kt-sales-agent.conf`는 운영용 예시 설정입니다.

현재 프로젝트는 Mock API 데모입니다. 실제 n8n 연결 시 브라우저 번들에 비밀키를
넣지 말고, Nginx/Gateway에서 `/api`를 same-origin reverse proxy하는 구성을 권장합니다.

## Quick Tunnel

```bash
cloudflared tunnel --url http://127.0.0.1:80
```

Quick Tunnel은 테스트/발표용입니다. 고정 주소가 필요하면 Named Tunnel과 systemd
서비스로 전환하세요.
