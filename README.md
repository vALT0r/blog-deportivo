# ⚽ Blog Deportivo - Daerbon

> Galería de fotografías de eventos deportivos - Sesiones de fútbol, atletismo, natación, ciclismo y más.

**URL**: [sport.daerbon.com.ar](https://sport.daerbon.com.ar)

## 📋 Descripción

Blog deportivo dedicado a documentar sesiones fotográficas de eventos deportivos. Cada evento incluye:
- Galería de fotos de alta calidad
- Información del evento (fecha, ubicación, deportista/equipo)
- Descripción detallada de la sesión
- Búsqueda por palabras clave
- Filtros por categoría deportiva

## 🛠️ Tecnología

- **Frontend**: HTML5, CSS3, JavaScript Vanilla (ES6+)
- **Hosting**: GitHub Pages
- **DNS**: Cloudflare (CNAME → sport.daerbon.com.ar)
- **Imágenes**: Cloudinary CDN
- **Fuentes**: Google Fonts (Poppins)
- **Iconos**: Font Awesome 6.4.0
- **Datos**: JSON estático

## 📁 Estructura de Carpetas

```
sport/
├── index.html              # Página principal
├── css/
│   └── styles.css          # Estilos (1000+ líneas)
├── js/
│   ├── script.js           # Lógica (búsqueda, filtros, modal)
│   └── events-data.json    # Base de datos de eventos
├── images/                 # Imágenes locales (futuro)
├── CNAME                   # Configuración GitHub Pages
├── .gitignore              # Archivos ignorados
└── README.md               # Este archivo
```

## 🚀 Características

### ✨ Principales
- ✅ Galería de eventos deportivos ordenados por fecha (recientes primero)
- ✅ Búsqueda en tiempo real por palabras clave
- ✅ Filtros por categoría deportiva (Fútbol, Atletismo, Natación, Ciclismo, Tenis, Hockey)
- ✅ Modal flotante dinámico sin recargar página
- ✅ Navegación de galería: flechas del teclado, swipe en mobile, botones de navegación
- ✅ Información detallada del evento: fecha, ubicación, deportista/equipo
- ✅ Diseño responsive (mobile, tablet, desktop)
- ✅ Contacto integrado
- ✅ Links a portfolio principal

### 🎨 Diseño
- Colores: Naranja (#FF8000) + Cyan (#47C7FC)
- Tipografía: Poppins (Google Fonts)
- Breakpoints: 480px (mobile) / 768px (tablet) / 900px (desktop)
- Animaciones suaves con CSS transitions
- Efecto backdrop blur en modal

## 📊 Estructura de Datos (JSON)

Cada evento en `events-data.json` contiene:

```json
{
  "id": 1,
  "title": "Torneo Regional de Fútbol - Final Decisiva",
  "date": "2026-05-20",
  "location": "Estadio Jorge Rafael Videla, Rosario, Santa Fe",
  "sport_category": "futbol",
  "athlete_team": "Equipo Regional Rosario",
  "description": "Descripción detallada del evento...",
  "summary": "Resumen breve de 2-3 líneas...",
  "keywords": ["futbol", "acción", "final", "gol"],
  "thumbnail": "https://res.cloudinary.com/.../image.jpg",
  "gallery_images": [
    {
      "image": "thumb_url",
      "fullImage": "full_url",
      "caption": "Descripción de la foto"
    }
  ]
}
```

### Campos Obligatorios
- `id`: Número único por evento
- `title`: Título del evento
- `date`: Fecha en formato YYYY-MM-DD
- `location`: Ubicación del evento
- `sport_category`: Categoría deportiva (futbol, atletismo, natacion, ciclismo, tenis, hockey, otro)
- `athlete_team`: Nombre del equipo o atleta
- `description`: Descripción completa (párrafos largos OK)
- `summary`: Resumen breve (2-3 líneas)
- `keywords`: Array de palabras clave para búsqueda
- `thumbnail`: URL de imagen 400x280px (desde Cloudinary)
- `gallery_images`: Array de objetos con image, fullImage, caption

## 🔧 Categorías Deportivas

| Código | Nombre | Emoji |
|--------|--------|-------|
| `futbol` | Fútbol | ⚽ |
| `atletismo` | Atletismo | 🏃 |
| `natacion` | Natación | 🏊 |
| `ciclismo` | Ciclismo | 🚴 |
| `tenis` | Tenis | 🎾 |
| `hockey` | Hockey | 🏒 |
| `otro` | Otro | 📷 |

## 📝 Cómo Agregar Eventos

### Método 1: Editar events-data.json (Simple)

1. Abre `sport/js/events-data.json`
2. Copia la estructura de un evento existente
3. Actualiza todos los campos
4. Asegúrate de tener imágenes en Cloudinary (o local en `images/`)
5. Commit y push

```bash
cd sport
git add .
git commit -m "Nuevo evento: [nombre del evento]"
git push origin main
```

### Método 2: GitHub Web UI (Sin clonar)

1. Abre https://github.com/vALT0r/blog-deportivo
2. Navega a `js/events-data.json`
3. Haz click en el icono de edición (lápiz)
4. Edita el JSON
5. Commit directamente (GitHub web)

## 📸 Imágenes en Cloudinary

Usar URLs con optimización:
```
Thumbnail: w_400,h_280,c_fill,q_85,f_auto
Full Image: w_1200,c_limit,q_90,f_auto
```

Ejemplo:
```
https://res.cloudinary.com/dunjl9u7y/image/upload/w_400,h_280,c_fill,q_85,f_auto/portfolio/eventos/futbol-1.jpg
```

## 🧪 Testing Local

### 1. Servidor Local
```bash
cd sport

# Con Python 3
python -m http.server 8000

# Con Python 2
python -m SimpleHTTPServer 8000

# Con Node.js
npx http-server
```

Accede a: http://localhost:8000

### 2. Verificar Funcionalidad

- [ ] Página carga sin errores
- [ ] Eventos se muestran en grid
- [ ] Búsqueda filtra en tiempo real
- [ ] Filtros por categoría funcionan
- [ ] Click en evento abre modal
- [ ] Modal: flechas navegan galería
- [ ] Modal: swipe en mobile funciona
- [ ] Modal: ESC cierra modal
- [ ] Links a portfolio funcionan

### 3. Responsive Testing

```
Breakpoints:
- 320px (mobile pequeño)
- 480px (mobile)
- 768px (tablet)
- 900px (desktop)
- 1200px (desktop grande)
```

## 📦 Deployment a GitHub Pages

### Setup Inicial (Una sola vez)

1. **Crear repo en GitHub**
   - Nombre: `blog-deportivo`
   - Public
   - No inicializar con README

2. **Agregar origen remoto**
   ```bash
   cd sport
   git remote add origin https://github.com/vALT0r/blog-deportivo.git
   git branch -M main
   git push -u origin main
   ```

3. **Configurar GitHub Pages**
   - Ir a Settings → Pages
   - Source: Deploy from a branch
   - Branch: main / (root)
   - Guardar

4. **Configurar DNS en Cloudflare**
   - Tipo: CNAME
   - Nombre: sport
   - Destino: vALT0r.github.io
   - Proxy: DNS only
   - TTL: Auto

### Deploy Posterior (Habitual)

```bash
cd sport
git add .
git commit -m "Descripción del cambio"
git push origin main
```

GitHub Pages deployará automáticamente en 1-2 minutos.

### Verificar Deploy

1. Accede a https://sport.daerbon.com.ar
2. Verifica que se carguen los eventos
3. Busca errores en consola (F12 → Console)

## 🔐 Seguridad

- ✅ Datos estáticos (JSON) - sin backend
- ✅ Sin autenticación requerida
- ✅ FormSubmit para contacto (sin exponer email)
- ✅ No tracking invasivo (solo Google Analytics)
- ✅ HTTPS automático (GitHub Pages)

## 📊 Analytics

- Google Analytics: ID `G-8XBS134N7Y` (compartido con portfolio)
- Eventos populares se pueden rastrear
- Comportamiento de búsqueda registrado

## 🐛 Solución de Problemas

### Eventos no se cargan
- Verifica que `events-data.json` es válido JSON (usa validator online)
- Revisa consola del navegador (F12 → Console)
- Comprueba que las URLs de Cloudinary son accesibles

### Busca no funciona
- Asegúrate que las palabras clave estén en `keywords`
- Búsqueda es case-insensitive
- Debounce de 300ms antes de filtrar

### Modal no abre
- Verifica que `sport_category` es válido
- Comprueba que existen `gallery_images`
- Revisa console para errores JavaScript

### Imágenes no se cargan
- Verifica URLs de Cloudinary (no pueden ser quebradas)
- Comprueba permisos CORS
- Usa `w=400,h=280` para thumbnails, `w=1200` para full

## 🚀 Mejoras Futuras

- [ ] Agregar sistema de comentarios (Disqus)
- [ ] Newsletter de nuevos eventos
- [ ] Filtro por rango de fechas
- [ ] Galería infinita (lazy-loading)
- [ ] Página de evento individual (URL `/eventos/1`)
- [ ] Admin panel para publicar eventos
- [ ] Integración con CMS (Netlify CMS, GitHub-based)
- [ ] Integración con redes sociales (share buttons)
- [ ] Cálculo de estadísticas (eventos por categoría)

## 📞 Contacto

Para consultas sobre eventos o sesiones fotográficas:
- 📧 Email: daerbon@gmail.com
- 📱 Instagram: [@daerbon](https://instagram.com/daerbon)
- 🌐 Portfolio: [daerbon.com.ar](https://daerbon.com.ar)

## 📄 Licencia

Todas las fotos © Daerbon - David Eric Bonucci. Derechos reservados.

---

**Última actualización**: Mayo 2026
**Versión**: 1.0
**Estado**: Activo
