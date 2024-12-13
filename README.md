# Tu Año en Crypto

Una aplicación web que analiza la actividad en blockchain de una dirección Ethereum a través de múltiples cadenas durante el año 2024.

## Requisitos Previos

1. **Bun**: Necesitas tener Bun instalado en tu sistema.
   ```bash
   # Para instalar Bun en macOS, Linux, o WSL:
   curl -fsSL https://bun.sh/install | bash
   ```

2. **API Key de Allium**: Necesitas una API key válida de Allium.

## Configuración Inicial

1. **Clonar el Repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd <nombre-del-proyecto>
   ```

2. **Instalar Dependencias**
   ```bash
   bun install
   ```

3. **Configurar Variables de Entorno**
   ```bash
   # Crear archivo .env
   echo "API_KEY=tu_api_key_de_allium" > .env
   ```

## Estructura del Proyecto

proyecto/
├── src/
│ ├── public/ # Archivos estáticos (HTML, CSS, JS)
│ ├── routes/ # Rutas de la API
│ ├── controllers/ # Controladores
│ ├── services/ # Servicios
│ └── types/ # Tipos TypeScript
├── .env # Variables de entorno
└── package.json

## Ejecutar el Proyecto

1. **Iniciar el Servidor de Desarrollo**
   ```bash
   bun start
   ```

2. **Acceder a la Aplicación**
   - Abre tu navegador y visita: `http://localhost:3000`

## Endpoints Disponibles

### API

- `GET /api/address/:address` - Obtiene datos crudos de una dirección
- `GET /stats/:address` - Obtiene estadísticas procesadas de una dirección
- `GET /addresses?addresses=addr1,addr2,...` - Obtiene datos de múltiples direcciones

### Frontend

- `/` - Interfaz de usuario principal

## Ejemplo de Uso

1. Visita `http://localhost:3000`
2. Ingresa una dirección Ethereum (ejemplo: `0xd8da6bf26964af9d7eed9e03e53415d37aa96045`)
3. Haz clic en "Buscar"
4. Visualiza las estadísticas de la dirección en diferentes cadenas

## Para Desarrolladores Frontend

El proyecto está configurado para servir archivos estáticos desde la carpeta `src/public/`. Los archivos principales son:

- `src/public/index.html` - Estructura HTML principal
- `src/public/styles.css` - Estilos CSS
- `src/public/script.js` - Lógica JavaScript del frontend

Para modificar el diseño, simplemente edita estos archivos. El servidor recargará automáticamente los cambios.

## Contribuir

1. Crea un fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Notas Adicionales

- La API key de Allium debe mantenerse segura y no debe compartirse
- El archivo `.env` está incluido en `.gitignore` para proteger las credenciales
- Los datos se obtienen de múltiples cadenas: Ethereum, Arbitrum, Base, Optimism, Scroll y zkSync