const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");

// 1. Configuración de AWS SNS (¡Totalmente limpio, sin credenciales!)
// El SDK tomará los permisos de la EC2 (LabRole) o de tu PC automáticamente.
const snsClient = new SNSClient({ region: "us-east-1" }); // Cambia a tu región si es distinta

// ⚠️ IMPORTANTE: Pega aquí el ARN de tu Topic que copiaste de la consola de AWS SNS
const TOPIC_ARN = "arn:aws:sns:us-east-1:716173486387:Alerta-Microservicio-Clientes";

// 2. Configuración del Monitoreo
const urlDestino = 'http://54.242.81.187:3000/api/heartbeat'; // Cambiar por la IP de tu EC2 para la simulación final
const intervalo = 100; // 100 milisegundos

let fallosConsecutivos = 0;
let alertaEnviada = false; // Variable de control para no hacer spam de correos al gerente

console.log(`Iniciando monitoreo de latencia hacia ${urlDestino}`);
console.log(`Enviando tráfico cada ${intervalo}ms...`);
console.log('Presiona Ctrl + C para detener la prueba.\n');

// 3. Función para enviar el correo vía AWS SNS
async function enviarAlertaSNS() {
    const params = {
        TopicArn: TOPIC_ARN,
        Subject: "🚨 ALERTA CRÍTICA: Microservicio DENEGADO",
        Message: `Hola Gerente,\n\nEl sistema de monitoreo ha detectado que el microservicio de Clientes ha dejado de responder a las peticiones.\n\nFallo confirmado a las: ${new Date().toISOString()}.\nSe requiere revisión inmediata de las instancias de AWS.`
    };

    try {
        const command = new PublishCommand(params);
        await snsClient.send(command);
        console.log("📧 ¡Correo de alerta enviado exitosamente vía AWS SNS al Gerente!");
    } catch (error) {
        console.error("❌ Error al intentar enviar el correo vía SNS:", error.message);
    }
}

// 4. Bucle principal de Monitoreo
setInterval(async () => {
    try {
        const respuesta = await fetch(urlDestino);
        const datos = await respuesta.json();
        
        const estado = datos.estado || 'DENEGADO';
        const latencia = datos.latencia_ms || '+300';
        const timestamp = datos.timestamp || Date.now();
        
        console.log(`[${estado}] Latencia: ${latencia}ms - Timestamp: ${timestamp}`);

        // Lógica del Umbral de Alerta
        if (estado === 'DENEGADO') {
            fallosConsecutivos++;
        } else {
            // El servicio responde correctamente, reiniciamos contadores
            fallosConsecutivos = 0; 
            if (alertaEnviada) {
                console.log('\n✅ El servicio se ha recuperado. Reiniciando el sistema de alertas.\n');
                alertaEnviada = false; // Listo para enviar otro correo si vuelve a fallar
            }
        }

        // Si falló 2 veces seguidas y no hemos avisado al gerente
        if (fallosConsecutivos >= 2 && !alertaEnviada) {
            console.log('\n🚨 UMBRAL DE ALERTA ALCANZADO: 2 fallos consecutivos en estado DENEGADO 🚨\n');
            alertaEnviada = true; // Bloqueamos la variable para no mandar más correos por esta misma caída
            await enviarAlertaSNS(); // Disparamos el correo
        }

    } catch (error) {
        // Esto se ejecuta si la instancia está completamente apagada o bloqueada
        console.log(`[DENEGADO] No se pudo conectar al microservicio (Servidor apagado o Timeout)`);
        fallosConsecutivos++;
        
        if (fallosConsecutivos >= 2 && !alertaEnviada) {
            console.log('\n🚨 UMBRAL DE ALERTA ALCANZADO: 2 fallos consecutivos en estado DENEGADO 🚨\n');
            alertaEnviada = true;
            await enviarAlertaSNS();
        }
    }
}, intervalo);