import json
import requests
from decimal import Decimal
from django.http import JsonResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from .models import Cliente, Factura, ClienteProyecto

@method_decorator(csrf_exempt, name='dispatch')
class GenerarFacturaCommand(View):
    def post(self, request):
        datos = json.loads(request.body)
        cliente_id = datos.get('cliente_id')
        
        try:
            cliente = Cliente.objects.get(id=cliente_id)
        except Cliente.DoesNotExist:
            return JsonResponse({"error": "Cliente no encontrado"}, status=404)

        proyectos = ClienteProyecto.objects.filter(cliente=cliente)
        if not proyectos.exists():
            return JsonResponse({"error": "El cliente no tiene proyectos"}, status=400)

        total_ahorro = Decimal('0.00')
        detalle_factura = [] # Lista para guardar el reporte proyecto por proyecto
        
        # IP de tu microservicio de proyectos (cambiar por la real en AWS)
        IP_PUBLICA_PROYECTO = "127.0.0.1:8001" 
        # TODO: Cambiar por la IP pública real del microservicio de proyectos en AWS,
        # TODO: descomentar el bloque de código que hace la petición real, y comentar el bloque de código simulado que puse 
        
        
        
        for proyecto in proyectos:
            print(f"Simulando consulta para el proyecto {proyecto.proyecto_id}...")
            ahorro_proyecto = Decimal('150.00')
            # 1. Armamos la URL exacta con el ID del proyecto
        #    url = f"http://{IP_PUBLICA_PROYECTO}/proyecto/calcular_total_ahorro/{proyecto.proyecto_id}"
            
            # 2. Hacemos la petición real al microservicio
        #    ahorro_proyecto = Decimal('0.00')
        #    try:
        #        # timeout=5 evita que nuestro sistema se quede colgado si el otro microservicio falla
        #        respuesta = requests.get(url, timeout=5) 
        #        
        #        # Si el otro microservicio responde OK (200)
        #        if respuesta.status_code == 200:
        #            datos_proyecto = respuesta.json()
        #            # Asumimos que el JSON del otro servicio trae un campo llamado 'total_ahorro'
        #            ahorro_proyecto = Decimal(str(datos_proyecto.get('total_ahorro', 0)))
        #    except requests.exceptions.RequestException:
        #        # Si hay error de conexión, el ahorro de este proyecto queda en 0 por ahora
        #        pass 
        #    
            # 3. Sumamos al total y guardamos en el detalle
            total_ahorro += ahorro_proyecto
            detalle_factura.append({
                "id_proyecto": proyecto.proyecto_id,
                "ahorro_obtenido": float(ahorro_proyecto)
            })

        # 4. Calculamos el 30% a cobrar
        monto_a_cobrar = total_ahorro * Decimal('0.30')

        # 5. Guardamos en la base de datos, incluyendo la lista de detalles
        factura = Factura.objects.create(
            cliente=cliente,
            detalle_proyectos=detalle_factura,
            total_ahorro_proyectos=total_ahorro,
            monto_facturado=monto_a_cobrar
        )

        # 6. Devolvemos la factura completa, bien detallada como querías
        return JsonResponse({
            "mensaje": "Factura generada con éxito",
            "factura_id": str(factura.id),
            "detalle_por_proyecto": detalle_factura,
            "resumen": {
                "total_ahorrado_cliente": float(total_ahorro),
                "total_a_pagar_30_pct": float(monto_a_cobrar)
            }
        }, status=201)
        
        
# --- QUERY (Lectura): Consultar Facturas ---
class ConsultarFacturasQuery(View):
    def get(self, request, cliente_id):
        # El .values() saca los datos de la BD directo a diccionario
        facturas = list(Factura.objects.filter(cliente__id=cliente_id).values(
            'id', 'fecha_emision', 'detalle_proyectos', 'total_ahorro_proyectos', 'monto_facturado', 'estado'
        ))
        return JsonResponse(facturas, safe=False, status=200)