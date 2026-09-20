# KT Opportunity 배포

## 개발/빌드

```bash
npm install
npm run dev
npm run build
```

## Nginx 반영

```bash
sudo rm -rf /var/www/kt-opportunity/*
sudo cp -r dist/. /var/www/kt-opportunity/
sudo nginx -t
sudo systemctl reload nginx
```

## 데이터 모드

기본은 `VITE_DATA_MODE=mock`이다. 실제 n8n 연동 시 `.env.production`에 다음을 설정한다.

```env
VITE_DATA_MODE=n8n
VITE_N8N_BASE_URL=https://your-secure-gateway.example.com
```

API Key, n8n Credential, Local LLM Gateway Token은 절대로 `VITE_*` 변수에 넣지 않는다.
브라우저에 번들되는 값은 비밀값이 아니다.
