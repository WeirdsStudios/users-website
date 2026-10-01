# CRM de USERS y operación aislada de clientes

Estado: CRM interno V1 y Portal USERS V1 entregados el 30 de septiembre de
2026. Este documento es la fuente de verdad para la siguiente fase; no se
crean bases nuevas ni consolas operativas sólo por existir este plan.

## Dos superficies, dos responsabilidades

### CRM interno de USERS

Vive en `products/users-website` y sólo lo usa personal autorizado de USERS.

- leads y empresas;
- contactos y oportunidades;
- proyectos, notas y tareas;
- cotizaciones y facturas de USERS.

El CRM nunca guarda las ventas, clientes finales ni catálogo operativo de un
negocio cliente.

### Portal y consola del cliente

El cliente entra desde `users.mx` para ver la relación con USERS: proyectos,
entregables, solicitudes, facturas y soporte. Desde ahí accede a su consola
operativa propia, construida sobre `USERS Client Foundation`.

Cada consola pertenece a un solo negocio y conserva su propio repositorio,
proyecto Supabase, Vercel y dominio. Allí se administran:

- catálogo, precios, ofertas y contenido comercial conectado al sitio;
- clientes finales;
- cotizaciones;
- ventas y, cuando corresponda, pagos;
- usuarios y roles del equipo del negocio.

Una consola no puede ver las tablas ni la base de otro negocio. RLS limita aún
más el acceso dentro de la consola por usuario y rol.

## Papel de WBTF Platform

`USERS Core` conserva sólo los contratos horizontales: identidad,
organizaciones, membresías, roles, invitaciones y patrones RLS. No absorbe
ventas, productos ni reglas de negocio.

`ADA` es el vertical WBTF de comercio/POS. La primera consola de cliente puede
validar las capacidades comunes de catálogo, cotización y venta; sólo cuando
ADA tenga un segundo consumidor real se extraen contratos reutilizables. No se
rebautiza ni se copia una implementación de cliente al Core.

`ACTIIVA` conserva membresías, reservas y reglas fitness. Puede adoptar Core,
pero no comparte sus tablas `gym_*` con las consolas de clientes ni con ADA.

## Orden de entrega

1. CRM interno V1: empresas, contactos, oportunidades, proyectos, notas,
   tareas, cotizaciones y facturas de USERS.
2. Portal USERS V1: resumen de cuenta, proyectos, entregables, solicitudes,
   facturas y enlaces seguros a cada consola del cliente. **Entregado:** las
   consultas se aíslan por organización mediante RLS; el personal publica
   contenido y vincula/actualiza la consola desde `/crm/clientes`; el cliente
   crea solicitudes y abre su propia operación desde su cuenta.
3. Foundation operativa V1: catálogo, clientes, cotizaciones y ventas para el
   primer negocio real que la adopte.
4. Evaluación de extracción hacia ADA / USERS Core sólo con evidencia de dos
   consumidores; antes de eso, no se publica una abstracción prematura.

## Límites explícitos

- SSO entre `users.mx` y una Foundation no se promete todavía: los proyectos
  Supabase separados tienen identidades separadas. Primero se diseña un puente
  de identidad seguro; mientras tanto el portal ofrece acceso federado.
- Editar una web sólo es posible si esa web consume datos de la consola (por
  ejemplo, catálogo y ofertas). No se promete que un panel pueda modificar
  arbitrariamente una web estática existente.
- No se crean bases, dominios ni consolas por cliente hasta que haya un negocio
  concreto para provisionar.

## Flujo de alta de cliente

1. En `/crm/leads`, USERS convierte el prospecto e invita a su Owner.
2. El Owner activa su cuenta y entra a `/cuenta/<empresa>`: desde el primer día
   ve su relación con USERS, soporte, proyectos y documentos.
3. Cuando su consola independiente está lista, el personal la vincula desde
   `/crm/clientes` con una URL `https`.
4. El portal muestra el acceso “Administra tu negocio”; éste abre solamente la
   consola de esa organización. Sus ventas, clientes y catálogo no pasan por
   la base compartida de USERS.
# Consola operativa estándar

Desde la migración `20260930020000_users_business_console_v1.sql`, cada
organización de USERS tiene una consola operativa disponible por defecto en
`/cuenta/{slug}/negocio`. No se provisionan proyectos Supabase ni despliegues
por cliente: catálogo, clientes finales, cotizaciones y ventas usan tablas
compartidas con `organization_id` y RLS basado en `organization_members`.

El alta, sea desde un lead o desde **CRM → Leads → Registrar negocio**, crea
la organización y al propietario, envía su invitación de acceso y deja lista
la consola sin una activación manual. Las cuentas existentes adquieren el
acceso en cuanto se aplique la migración.
