# EloVate — Environment Variables

Copy this file to `.env` and fill in your values.

```
cp .env.example .env
```

---

## PostgreSQL

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/elovate
```

> **How to create the database:**
> ```bash
> # 1. Start psql
> psql -U postgres
>
> # 2. Create database
> CREATE DATABASE elovate;
> \q
>
> # 3. Run the schema
> psql -U postgres -d elovate -f schema.sql
> ```

## JWT

```env
JWT_SECRET=replace_this_with_a_random_256bit_string
```

Generate a secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Server Config

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

---

## Full .env Template

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/elovate
JWT_SECRET=replace_this_with_a_random_256bit_string
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```
