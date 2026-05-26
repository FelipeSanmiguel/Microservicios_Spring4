const urlDestino = 'http://localhost:3000/api/heartbeat';
const intervalo = 100; 

console.log(`Iniciando monitoreo del Heartbeat hacia ${urlDestino}`);
console.log(`Enviando tráfico cada ${intervalo}ms...`);
console.log('Presiona Ctrl + C en esta terminal para detener la prueba.\n');

setInterval(async () => {
    try {
        const respuesta = await fetch(urlDestino);
        
        if (respuesta.ok) {
            const datos = await respuesta.json();
            console.log(`[ACTIVO] Servidor respondiendo - Timestamp: ${datos.timestamp}`);
        } else {
            console.log(`[FALLO] El servidor respondió con un error: ${respuesta.status}`);
        }
    } catch (error) {
        console.log(`[CAÍDO] No hay respuesta. El microservicio parece estar apagado.`);
    }
}, intervalo);