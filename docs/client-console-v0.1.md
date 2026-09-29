# USERS Client Console v0.1

Estado: código validado localmente; **no desplegado ni aplicado a producción**.

## Alcance de la primera rebanada

- acceso con Supabase Auth;
- CRM restringido por `USERS_STAFF_EMAILS`;
- conversión idempotente de un prospecto completado en organización;
- invitación del propietario;
- activación de la propia membresía;
- cuenta del cliente limitada por RLS a sus organizaciones.

No incluye proyectos, tickets, facturas, archivos ni métricas. Tampoco cambia
la captura pública del Motor de Análisis.

## Contrato compartido

La UI consume `@weirdsstudios/users-core@0.1.0-rc.1`. La migración
`supabase/migrations/20260928000000_users_core_tenancy.sql` adopta el contrato
de organizaciones, membresías, roles y estados sin compartir la base de datos
de ACTIIVA.

## Condiciones antes del despliegue

1. Configurar acceso de sólo lectura a GitHub Packages en desarrollo y Vercel.
2. Revisar y aplicar la migración al proyecto Supabase de USERS.
3. Definir en Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`;
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (se acepta temporalmente el nombre
     anterior `NEXT_PUBLIC_SUPABASE_ANON_KEY`);
   - `SUPABASE_SECRET_KEY` (se acepta temporalmente
     `SUPABASE_SERVICE_ROLE_KEY`);
   - `USERS_STAFF_EMAILS` con correos separados por coma;
   - `NEXT_PUBLIC_SITE_URL=https://www.users.mx`.
4. En Supabase Auth, autorizar `https://www.users.mx/auth/confirm` y las URLs de
   preview/local necesarias.
5. Cambiar la plantilla **Invite user** para usar el flujo SSR:

```text
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite&next=/cuenta/configurar
```

6. Crear o confirmar al menos una cuenta de personal incluida en
   `USERS_STAFF_EMAILS`.
7. Probar el flujo completo con un prospecto de prueba antes de convertir un
   cliente real.

## Reversión

El código puede revertirse sin borrar datos. La migración agrega tablas y una
columna opcional; no modifica los prospectos existentes. No se deben eliminar
organizaciones ni usuarios como parte de una reversión de aplicación.
