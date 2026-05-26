const urlDestino = 'http://localhost:3000/api/heartbeat';
const intervalo = 100; 

let fallosConsecutivos = 0; // Variable para rastrear el Umbral de Alerta

console.log(`Iniciando monitoreo de latencia hacia ${urlDestino}`);
console.log(`Enviando tráfico cada ${intervalo}ms...`);
console.log('Presiona Ctrl + C para detener la prueba.\n');

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
            fallosConsecutivos = 0; // Reiniciamos a 0 si la respuesta vuelve a ser OK o DEGRADADO
        }

        if (fallosConsecutivos >= 2) {
            console.log('\n🚨 UMBRAL DE ALERTA ALCANZADO: 2 fallos consecutivos en estado DENEGADO 🚨\n');
            // Como consultores, aquí es donde entraría la lógica para enviar una notificación 
            // a AWS SNS o CloudWatch para reiniciar la instancia o aplicar un autoscaling.
        }

    } catch (error) {
        console.log(`[DENEGADO] No se pudo conectar al microservicio (Caído o Timeout)`);
        fallosConsecutivos++;
        
        if (fallosConsecutivos >= 2) {
            console.log('\n🚨 UMBRAL DE ALERTA ALCANZADO: 2 fallos consecutivos en estado DENEGADO 🚨\n');
        }
    }
}, intervalo);