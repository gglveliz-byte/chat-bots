# Páginas Legales - Instrucciones de Personalización

## 📋 ¿Qué personalizar?

Estas páginas legales contienen **placeholders** que debes reemplazar con información real de tu empresa:

### 1️⃣ **Información de Contacto**

Busca y reemplaza en **TODAS** las páginas legales:

- `[Nombre de tu Empresa S.L./S.A.]` → Nombre legal de tu empresa
- `[NIF/CIF]` → Tu número de identificación fiscal
- `[Dirección completa]` → Dirección física completa
- `[Ciudad]` → Tu ciudad
- `[Código Postal]` → Tu código postal
- `[Tu país]` → Tu país
- `[Tu teléfono]` → Tu número de teléfono
- `contacto@tuchatbot.com` → Tu email de contacto real
- `soporte@tuchatbot.com` → Tu email de soporte real
- `privacidad@tuchatbot.com` → Tu email de privacidad real
- `legal@tuchatbot.com` → Tu email legal real
- `cookies@tuchatbot.com` → Tu email para cookies real

### 2️⃣ **Información Legal**

En **Aviso Legal** (`/legal/aviso-legal`):

- `[Registro Mercantil]` → Datos de registro si aplica
- `[Tu Ciudad]` → Ciudad de jurisdicción
- `[Responsable de Protección de Datos]` → Nombre del responsable

### 3️⃣ **Términos Específicos**

En **Términos y Condiciones** (`/legal/terminos`):

- Revisa los límites del plan Trial (actualmente: 100 mensajes/día)
- Verifica las tarifas mencionadas
- Ajusta la sección de "Legislación Aplicable" según tu jurisdicción

### 4️⃣ **Privacidad y GDPR**

En **Política de Privacidad** (`/legal/privacidad`):

- Verifica la lista de terceros (OpenAI, Meta, Telegram, PayPal)
- Actualiza el responsable de protección de datos
- Ajusta según las leyes de tu país (GDPR, CCPA, LGPD, etc.)

### 5️⃣ **Cookies**

En **Política de Cookies** (`/legal/cookies`):

- Verifica la lista de cookies utilizadas
- Actualiza si agregas nuevas cookies o servicios de terceros

---

## 🔍 **Archivos a Personalizar**

```
frontend/src/app/legal/
├── terminos/page.tsx           # Términos y Condiciones
├── privacidad/page.tsx         # Política de Privacidad
├── cookies/page.tsx            # Política de Cookies
└── aviso-legal/page.tsx        # Aviso Legal

frontend/src/components/legal/
├── Footer.tsx                  # Footer con links legales
├── CookieBanner.tsx           # Banner de aceptación de cookies
└── index.ts                   # Exportaciones
```

---

## ⚠️ **IMPORTANTE - Cumplimiento Legal**

### **GDPR (Unión Europea)**
Si tienes usuarios en la UE, DEBES:
- ✅ Tener política de privacidad clara
- ✅ Obtener consentimiento para cookies no esenciales
- ✅ Permitir descarga/eliminación de datos
- ✅ Nombrar un responsable de protección de datos

### **CCPA (California, USA)**
Si tienes usuarios en California:
- ✅ Permitir opt-out de venta de datos
- ✅ Derecho a saber qué datos recopilas
- ✅ Derecho a eliminación de datos

### **LGPD (Brasil)**
Si tienes usuarios en Brasil:
- ✅ Similar a GDPR
- ✅ Bases legales para procesamiento
- ✅ Designar agente de tratamiento

---

## 🛠️ **Funcionalidades Implementadas**

### ✅ **Footer**
- Links a todas las páginas legales
- Redes sociales (puedes personalizar los enlaces)
- Copyright dinámico (año actual)
- Diseño responsivo

### ✅ **Banner de Cookies**
- Aparece en la primera visita
- Opción: "Solo esenciales" o "Aceptar todas"
- Se guarda en localStorage
- Diseño responsivo

### ✅ **Páginas Legales**
- Diseño profesional con "glass effect"
- Totalmente responsivas
- Fácil navegación
- Link de regreso al inicio

---

## 📝 **Recomendaciones Adicionales**

1. **Consulta con un abogado**: Estas páginas son plantillas genéricas. Es recomendable que un abogado las revise según tu jurisdicción.

2. **Actualiza las fechas**: La fecha de "Última actualización" se genera automáticamente, pero verifica que sea correcta.

3. **Mantén coherencia**: Usa la misma información de contacto en todas las páginas.

4. **Añade específicos de tu negocio**: Si tienes políticas especiales, agrégalas.

5. **Revisa regularmente**: Actualiza las políticas cuando cambies servicios de terceros o funcionalidades.

---

## 🚀 **Próximos Pasos**

1. Personaliza todos los placeholders con información real
2. Revisa con un abogado (recomendado)
3. Actualiza las redes sociales en el Footer
4. Verifica que el CookieBanner funcione correctamente
5. Considera agregar más idiomas si es internacional

---

## 📧 **Contacto**

Si necesitas ayuda con la personalización, consulta con tu equipo legal o un abogado especializado en derecho digital.
