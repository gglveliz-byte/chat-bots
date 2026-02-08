# ChatBot SaaS - Sistema Multi-Plataforma

Sistema de chatbots para WhatsApp, Messenger, Instagram, Telegram y Web Chat.

## Estructura del Proyecto

```
chats bots/
├── backend/                 # API Node.js + Express
│   ├── src/
│   │   ├── config/         # Configuración (DB, constantes)
│   │   ├── controllers/    # Controladores (auth, admin, client, service)
│   │   ├── middleware/     # Middlewares (auth, rate limiter)
│   │   ├── routes/         # Rutas de la API
│   │   └── utils/          # Utilidades (JWT, hash)
│   ├── migrations/         # Migraciones de DB
│   └── seeds/              # Datos iniciales
│
├── frontend/               # Next.js + React
│   └── src/
│       ├── app/            # Páginas (Next.js App Router)
│       │   ├── auth/       # Login, registro
│       │   ├── admin/      # Panel admin
│       │   └── client/     # Panel cliente + servicios
│       ├── components/     # Componentes reutilizables
│       ├── lib/            # API client
│       └── stores/         # Estado global (Zustand)
│
└── SRS_ChatBot_System.md   # Documento de especificación
```

## Requisitos

- Node.js 18+
- PostgreSQL (ya configurado en Render)
- npm o yarn

## Instalación

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd frontend
npm install
```

## Ejecución

### Backend (Puerto 3001)

```bash
cd backend
npm run dev
```

### Frontend (Puerto 3000)

```bash
cd frontend
npm run dev
```

## Credenciales de Prueba

### Admin
- Email: `admin@chatbot.com`
- Password: `Admin123!`

## Base de Datos

La base de datos está en Render con el esquema `chatbot_saas`.

**Tablas creadas:**
- admins
- clients
- businesses
- services
- client_services
- conversations
- messages
- bot_configs
- payments
- email_verifications
- refresh_tokens
- audit_logs

## API Endpoints

### Autenticación
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/register` - Registro
- `POST /api/v1/auth/logout` - Cerrar sesión
- `GET /api/v1/auth/me` - Usuario actual

### Admin
- `GET /api/v1/admin/dashboard` - Dashboard
- `GET /api/v1/admin/clients` - Listar clientes
- `POST /api/v1/admin/clients` - Crear cliente
- `GET /api/v1/admin/payments` - Listar pagos
- `PUT /api/v1/admin/payments/:id/validate` - Validar pago

### Cliente
- `GET /api/v1/client/profile` - Mi perfil
- `GET /api/v1/client/services` - Mis servicios
- `POST /api/v1/client/services/trial` - Activar trial
- `GET /api/v1/client/payments` - Mis pagos

### Servicios
- `GET /api/v1/service/:code/conversations` - Conversaciones
- `GET /api/v1/service/:code/conversations/:id/messages` - Mensajes
- `POST /api/v1/service/:code/conversations/:id/messages` - Enviar mensaje
- `GET /api/v1/service/:code/config` - Configuración del bot

## Tecnologías

### Backend
- Node.js + Express
- PostgreSQL
- JWT para autenticación
- Socket.io para tiempo real
- bcrypt para contraseñas

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion (animaciones)
- Zustand (estado)
- Axios (HTTP)

## Características

- [x] Sistema de autenticación (login, registro, JWT)
- [x] Panel Admin (dashboard, clientes, pagos)
- [x] Panel Cliente (dashboard, servicios, pagos)
- [x] Sistema de Trial (5 días gratis)
- [x] Panel WhatsApp (estilo WhatsApp)
- [x] Diseño futurista con glassmorphism
- [x] Responsive design
- [ ] Integración con Meta API (n8n)
- [ ] Integración con OpenAI
- [ ] Integración con PayPal
- [ ] Widget embebible

## Próximos Pasos

1. Configurar n8n para webhooks de Meta API
2. Integrar OpenAI para respuestas del bot
3. Configurar PayPal para pagos automáticos
4. Crear widget de chat embebible
5. Crear paneles para Messenger, Instagram, Telegram

## Variables de Entorno

### Backend (.env)
```
DATABASE_URL=postgresql://...
JWT_SECRET=...
OPENAI_API_KEY=...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_WS_URL=http://localhost:3001
```
