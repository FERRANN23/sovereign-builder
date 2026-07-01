// Función serverless.
// Vercel la expone automáticamente en la ruta /api/brief:
// el nombre y la ubicación del archivo (api/brief.js) DEFINEN la ruta.
export default function handler(request, response) {
  // Por ahora devolvemos un texto FIJO, sin llamar a la IA todavía.
  // El objetivo de este paso es probar que la tubería responde
  // antes de conectar el motor (Claude) en la Tarea 3.
  const briefDePrueba = "Este es un brief de prueba. La tubería funciona.";

  // Respondemos: código 200 (OK) + un objeto JSON con el brief.
  response.status(200).json({ brief: briefDePrueba });
}
