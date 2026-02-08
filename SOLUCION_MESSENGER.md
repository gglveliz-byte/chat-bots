# 🔧 Solución: Messenger no conecta (no_pages_found)

## Problema
Cuando intentas conectar Messenger, obtienes el error: `no_pages_found`

## Causa Raíz
El código solicita el permiso `pages_show_list`, pero tu app de Meta for Developers **NO tiene ese permiso agregado**.

## Solución

### Paso 1: Agregar permiso en Meta for Developers

1. Ve a https://developers.facebook.com/apps
2. Selecciona tu app
3. En el menú izquierdo, ve a **"Casos de uso"** o **"Use Cases"**
4. Busca el caso de uso de **Messenger** y haz clic en **"Configurar"** o **"Customize"**
5. Verás una lista de permisos (Permissions). Busca y agrega:
   - ✅ `pages_show_list` (si no está)
   - ✅ `pages_messaging` (debe estar)
   - ✅ `pages_manage_metadata` (debe estar)
   - ✅ `pages_read_engagement` (debe estar)
6. Haz clic en **"Guardar cambios"** o **"Save"**

### Paso 2: Hacer lo mismo para Instagram

Repite el proceso para Instagram:
1. En **"Casos de uso"**, busca **Instagram**
2. Agrega los permisos:
   - ✅ `pages_show_list`
   - ✅ `pages_messaging`
   - ✅ `pages_manage_metadata`
   - ✅ `pages_read_engagement`
   - ✅ `instagram_basic`
   - ✅ `instagram_manage_messages`

### Paso 3: Asegúrate de estar en modo Live

- Ve a la parte superior de la app
- Verifica que esté en modo **"Live"** (no Development)
- Si está en Development, cambia a Live

### Paso 4: Reconectar Messenger

1. Ve a tu panel: https://neurochat-front.onrender.com/client/services/connect
2. Si Messenger ya está conectado, **desconéctalo primero**
3. Vuelve a conectar Messenger
4. Debería funcionar ahora ✅

## ¿Por qué pasó esto?

Cuando cambié los scopes en el código para agregar `pages_show_list`, tu app en Meta for Developers necesitaba tener ese permiso configurado también.

**Los scopes del código y los permisos de la app DEBEN coincidir**.

## Si aún no funciona

Si después de seguir estos pasos aún no funciona, revisa:
1. Que la app esté en modo **Live** (no Development)
2. Que todos los permisos estén **Aprobados** (no pendientes)
3. Que el webhook esté configurado correctamente: `https://neurochat-xtwp.onrender.com/api/v1/webhook/meta`
4. Que tengas una página de Facebook activa con Messenger habilitado
