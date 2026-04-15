# Panoramas — Guía de Setup (Backend + Postgres en Docker)

Stack: **Next.js 14 · Prisma · PostgreSQL 16 (Docker) · JWT (cookies httpOnly) · bcrypt**

## Requisitos

- [Bun](https://bun.sh) (ya lo usa el proyecto)
- [Docker Desktop](https://www.docker.com/products/docker-desktop) corriendo
- (Opcional) [DBeaver](https://dbeaver.io) para inspeccionar la base

## 1. Levantar Postgres

```bash
bun run db:up
```

Esto arranca un contenedor `panoramas-db` en `localhost:5432` con:

| Campo    | Valor       |
| -------- | ----------- |
| Host     | `localhost` |
| Puerto   | `5432`      |
| Database | `panoramas` |
| Usuario  | `panoramas` |
| Password | `panoramas` |

Los datos persisten en el volumen de Docker `panoramas_pgdata`.

Comandos útiles:

```bash
bun run db:logs    # ver logs del contenedor
bun run db:down    # detener Postgres
```

## 2. Aplicar el schema y cargar datos iniciales

```bash
bun run db:push    # crea las tablas (sin migraciones)
bun run db:seed    # carga las 10 actividades + usuario demo
```

> Si prefieres historial de migraciones, usa `bun run db:migrate` en vez de `db:push`.

Usuario demo creado por el seed:

- **Email:** `demo@panoramas.cl`
- **Password:** `demo1234`

## 3. Correr la app

```bash
bun run dev
```

Abre http://localhost:3000

## 4. Conectar DBeaver

New Database Connection → PostgreSQL → usa los valores de la tabla de arriba. El driver default funciona, no necesitas configuración extra.

Una vez conectado, verás las tablas `User`, `Activity`, `Booking` bajo `panoramas` → `schemas` → `public`.

También puedes usar **Prisma Studio** directamente:

```bash
bun run db:studio
```

## API Endpoints

### Auth

- `POST /api/auth/register` — `{ nombre, email, password, preferencias }`
- `POST /api/auth/login` — `{ email, password }`
- `POST /api/auth/logout`
- `GET  /api/auth/me`

### Actividades

- `GET /api/activities` — filtros: `?categoria=cine&q=jazz&destacadas=true&tendencia=true`
- `GET /api/activities/:id`

### Reservas (requieren sesión)

- `GET    /api/bookings` — reservas del usuario actual
- `POST   /api/bookings` — `{ actividadId, fecha, hora, personas }`
- `PATCH  /api/bookings/:id` — `{ estado?, fecha?, hora?, personas? }`
- `DELETE /api/bookings/:id`

### Usuario

- `PATCH /api/users/me` — `{ nombre?, preferencias? }`

### Clima

- `GET /api/weather` — usa OpenWeatherMap si `OPENWEATHER_API_KEY` está seteada, si no devuelve mock.

## Variables de entorno

En `.env`:

```
DATABASE_URL="postgresql://panoramas:panoramas@localhost:5432/panoramas?schema=public"
JWT_SECRET="cambia-esto-en-produccion-minimo-32-chars"
OPENWEATHER_API_KEY=  # opcional
OPENWEATHER_CITY="Santiago,cl"
```

> **Importante:** cambia `JWT_SECRET` antes de desplegar.

## Scripts de package.json

| Comando             | Qué hace                                |
| ------------------- | --------------------------------------- |
| `bun run dev`       | Next.js en modo desarrollo              |
| `bun run build`     | Build de producción                     |
| `bun run db:up`     | Arranca Postgres en Docker              |
| `bun run db:down`   | Detiene Postgres                        |
| `bun run db:logs`   | Logs del contenedor                     |
| `bun run db:push`   | Sincroniza el schema (sin migraciones)  |
| `bun run db:migrate`| Crea y aplica una migración             |
| `bun run db:seed`   | Carga datos iniciales                   |
| `bun run db:studio` | Abre Prisma Studio (GUI web para la DB) |
| `bun run db:reset`  | Borra todo y reaplica migraciones       |

## Troubleshooting

**"Can't reach database server at localhost:5432"**
→ Docker Desktop no está corriendo, o el contenedor no se levantó. Ejecuta `bun run db:up` y revisa `bun run db:logs`.

**Error de tipos de Prisma después de cambiar el schema**
→ Corre `bunx prisma generate` para regenerar el cliente.

**Quiero empezar de cero**
→ `bun run db:down && docker volume rm panoramas_pgdata && bun run db:up && bun run db:push && bun run db:seed`

## Arquitectura

```
app/
├── api/
│   ├── auth/          # register, login, logout, me
│   ├── activities/    # GET list, GET :id
│   ├── bookings/      # GET, POST, PATCH :id, DELETE :id
│   ├── users/me/      # PATCH
│   └── weather/       # GET
├── (auth)/            # login, register
├── activity/[id]/     # detalle (server, Prisma directo)
├── bookings/          # lista del usuario (client, fetch)
├── explore/           # buscar (client, fetch)
├── map/               # mapa (client, fetch)
└── page.tsx           # home (server, Prisma directo)

lib/
├── db.ts              # Prisma singleton
├── auth.ts            # JWT, bcrypt, cookies
├── serializers.ts     # DB row → frontend types
├── categorias.ts      # labels e iconos (estático)
├── types.ts           # tipos del frontend (no tocar)
└── weather.ts         # OpenWeatherMap + fallback

prisma/
├── schema.prisma      # modelos
└── seed.ts            # datos iniciales
```

Las páginas **server** (home, detalle) llaman a Prisma directamente. Las páginas **client** (explore, map, bookings) hacen `fetch` a los endpoints. La autenticación usa JWT en cookie `httpOnly` llamada `panoramas_session`.
