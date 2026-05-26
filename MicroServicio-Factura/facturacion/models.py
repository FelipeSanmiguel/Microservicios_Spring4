from django.db import models
import uuid

class Cliente(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre = models.CharField(max_length=255)

    def __str__(self):
        return self.nombre


class ClienteProyecto(models.Model):
    """
    Esta tabla relaciona qué proyectos (de la BD NoSQL) le pertenecen a qué cliente.
    Nos servirá para saber a qué proyectos consultarles su ahorro.
    """
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='proyectos')
    # Guardamos el ID del proyecto como texto (CharField) porque viene de una NoSQL
    proyecto_id = models.CharField(max_length=100) 

    class Meta:
        # Evita que se repita la misma combinación de cliente y proyecto
        unique_together = ('cliente', 'proyecto_id')

    def __str__(self):
        return f"Cliente: {self.cliente.nombre} - Proyecto ID: {self.proyecto_id}"


class Factura(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    cliente = models.ForeignKey(Cliente, on_delete=models.RESTRICT)
    fecha_emision = models.DateTimeField(auto_now_add=True)
    
    # Campo nuevo: Aquí guardaremos la lista de proyectos y sus ahorros
    detalle_proyectos = models.JSONField(default=list) 
    
    total_ahorro_proyectos = models.DecimalField(max_digits=12, decimal_places=2)
    monto_facturado = models.DecimalField(max_digits=12, decimal_places=2) 
    estado = models.CharField(max_length=20, default='PENDIENTE')

    def __str__(self):
        return f"Factura {self.id} - Total: ${self.monto_facturado}"