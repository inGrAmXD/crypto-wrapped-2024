import { serve } from "bun";
import alliumRoutes from "./routes/alliumRoutes";

// Iniciar el servidor
serve({
  port: 3000,
  fetch: async (req) => {
    return alliumRoutes(req);
  },
});

console.log("Servidor corriendo en http://localhost:3000");

export {}; // Convertir el archivo en un módulo