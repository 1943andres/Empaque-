# Sistema PQR Forest Edge con Integración OpenAI

Sistema integral de gestión de PQRs (Peticiones, Quejas y Reclamos) para Alimentos Enriko con asistente de IA integrado.

## 🚀 Características

- **Gestión completa de PQRs** con trazabilidad
- **Asistente de IA** especializado en productos lácteos
- **Sistema de autenticación** con roles de usuario
- **Subida de archivos** con drag & drop
- **Dashboard de estadísticas** con gráficos interactivos
- **Comentarios y seguimiento** en tiempo real
- **Interfaz responsive** y moderna

## 📋 Prerrequisitos

- Python 3.8 o superior
- Una cuenta de OpenAI con acceso a la API
- Navegador web moderno

## 🛠️ Instalación

### 1. Clonar el repositorio
```bash
git clone <tu-repositorio>
cd sistema-pqr-openai
```

### 2. Crear entorno virtual
```bash
python -m venv venv

# En Windows:
venv\Scripts\activate

# En macOS/Linux:
source venv/bin/activate
```

### 3. Instalar dependencias
```bash
pip install -r requirements.txt
```

### 4. Configurar variables de entorno
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar el archivo .env con tu API key de OpenAI
nano .env  # o usar tu editor preferido
```

**Importante:** Debes obtener tu API key de OpenAI desde https://platform.openai.com/api-keys y reemplazar `sk-tu-api-key-de-openai-aqui` en el archivo `.env`.

### 5. Ejecutar la aplicación
```bash
python app.py
```

La aplicación estará disponible en: http://127.0.0.1:5000

## 🔐 Usuarios por Defecto

El sistema viene con usuarios predefinidos para pruebas:

| Email | Contraseña | Rol |
|-------|------------|-----|
| admin@alimentos-enriko.com | admin123 | Administrador |
| juan.perez@alimentos-enriko.com | calidad123 | Calidad |
| maria.gonzalez@alimentos-enriko.com | registro123 | Registrador |
| cliente@email.com | cliente123 | Cliente |

## 🏗️ Estructura del Proyecto

```
sistema-pqr-openai/
├── app.py                 # Aplicación principal Flask
├── config.py              # Configuración de la aplicación
├── requirements.txt       # Dependencias Python
├── .env.example          # Ejemplo de variables de entorno
├── index.html            # Frontend de la aplicación
├── uploads/              # Directorio para archivos subidos
├── pqr_system.db         # Base de datos SQLite (se crea automáticamente)
└── README.md             # Este archivo
```

## 🤖 Configuración de OpenAI

### Obtener API Key

1. Ve a https://platform.openai.com/
2. Crea una cuenta o inicia sesión
3. Navega a "API Keys" en tu dashboard
4. Crea una nueva API key
5. Copia la key y pégala en tu archivo `.env`

### Configuración Avanzada

Puedes personalizar el comportamiento del asistente de IA editando las siguientes variables en `.env`:

```env
OPENAI_MODEL=gpt-3.5-turbo          # Modelo a utilizar
OPENAI_MAX_TOKENS=500               # Máximo de tokens por respuesta
OPENAI_TEMPERATURE=0.7              # Creatividad de las respuestas (0.0-1.0)
```

## 📊 Funcionalidades por Rol

### Cliente
- Crear nuevas PQRs
- Usar asistente de IA
- Ver sus propias PQRs (solo lectura)

### Registrador
- Todas las funciones de Cliente
- Ver todas las PQRs
- Añadir comentarios a PQRs

### Calidad
- Todas las funciones de Registrador
- Editar estado de PQRs
- Asignar PQRs a agentes
- Establecer fechas de resolución

### Administrador
- Todas las funciones anteriores
- Gestión de usuarios
- Ver estadísticas completas
- Eliminar PQRs y usuarios

## 🔧 Personalización

### Modificar el Contexto del Asistente de IA

Edita la variable `system_context` en `app.py` (línea ~410) para personalizar el comportamiento del asistente:

```python
system_context = """
Tu contexto personalizado aquí...
"""
```

### Cambiar Configuración de Base de Datos

Por defecto usa SQLite. Para usar PostgreSQL o MySQL, modifica `DATABASE_URL` en `.env`:

```env
# PostgreSQL
DATABASE_URL=postgresql://usuario:contraseña@localhost/pqr_db

# MySQL
DATABASE_URL=mysql://usuario:contraseña@localhost/pqr_db
```

## 🚨 Solución de Problemas

### Error: "OPENAI_API_KEY no está configurada"
- Verifica que hayas copiado `.env.example` a `.env`
- Asegúrate de que tu API key de OpenAI sea válida
- No incluyas espacios alrededor del `=` en el archivo `.env`

### Error: "ModuleNotFoundError"
- Verifica que el entorno virtual esté activado
- Ejecuta `pip install -r requirements.txt` nuevamente

### Error de conexión con OpenAI
- Verifica tu conexión a internet
- Confirma que tu API key tenga créditos disponibles
- Revisa los límites de uso en tu cuenta de OpenAI

### La aplicación no carga
- Verifica que el puerto 5000 no esté en uso
- Revisa los logs en la consola para errores específicos

## 🔒 Seguridad

- **Nunca** compartas tu API key de OpenAI
- Cambia las contraseñas por defecto en producción
- Considera usar HTTPS en producción
- Revisa regularmente los logs de acceso

## 📝 Desarrollo

### Añadir Nuevas Funcionalidades

1. **Backend**: Añade nuevas rutas en `app.py`
2. **Frontend**: Modifica `index.html` para la interfaz
3. **Base de datos**: Actualiza los modelos SQLAlchemy si es necesario

### Estructura de la API

- `POST /api/login` - Autenticación
- `GET /api/current_user` - Usuario actual
- `GET/POST /api/pqrs` - Gestión de PQRs
- `GET/POST /api/users` - Gestión de usuarios
- `POST /api/ai_chat` - Interacción con IA
- `GET /api/stats` - Estadísticas

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo LICENSE para más detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu funcionalidad
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📞 Soporte

Si necesitas ayuda:

1. Revisa la sección de solución de problemas
2. Busca en los issues existentes
3. Crea un nuevo issue con detalles del problema

---

**¡Disfruta usando el Sistema PQR con IA! 🌲🤖**