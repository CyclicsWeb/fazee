"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ExpedienteVehiculoPage() {
  const [vehiculos, setVehiculos] = useState<any[]>([]);
  const [servicios, setServicios] = useState<any[]>([]);
  const [vehiculoServicio, setVehiculoServicio] = useState<any[]>([]);
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [selectedVehiculo, setSelectedVehiculo] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const supabase = createClient();
    const { data: vehiculosData } = await supabase
      .from("vehiculo")
      .select("*, cliente(*)")
      .order("id_vehiculo");
    const { data: serviciosData } = await supabase.from("servicio").select("*, mecanico(*)");
    const { data: vehiculoServicioData } = await supabase.from("vehiculo_servicio").select("*");
    const { data: ordenesData } = await supabase.from("ordenes").select("*");
    
    setVehiculos(vehiculosData || []);
    setServicios(serviciosData || []);
    setVehiculoServicio(vehiculoServicioData || []);
    setOrdenes(ordenesData || []);
    setLoading(false);
  };

  const getExpediente = (idVehiculo: number) => {
    const relaciones = vehiculoServicio.filter((vs) => vs.id_vehiculo === idVehiculo);
    const expedientes = relaciones.map((rel) => {
      const servicio = servicios.find((s) => s.id_servicio === rel.id_servicio);
      const orden = ordenes.find((o) => o.id_vehiculo === idVehiculo);
      const total = servicio
        ? Number(servicio.costo || 0) + Number(servicio["Mano de obra"] || 0)
        : 0;
      return {
        fecha: rel.fecha_realizacion || servicio?.fecha,
        descripcion: servicio?.descripcion,
        observaciones: rel.observaciones,
        costo: servicio?.costo,
        manoObra: servicio["Mano de obra"],
        cantidad: servicio?.Cantidad,
        total,
        mecanico: servicio?.mecanico?.nombre,
        orden: orden,
      };
    });
    return expedientes.sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""));
  };

  if (loading) {
    return <p>Cargando...</p>;
  }

  const vehiculo = vehiculos.find((v) => v.id_vehiculo === selectedVehiculo);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Expediente del vehículo</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Seleccionar vehículo</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            className="w-full border rounded-md p-2"
            value={selectedVehiculo || ""}
            onChange={(e) => setSelectedVehiculo(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Seleccione un vehículo</option>
            {vehiculos.map((v) => (
              <option key={v.id_vehiculo} value={v.id_vehiculo}>
                {v.placa} - {v.marca} {v.modelo} ({v.cliente?.nombres} {v.cliente?.apellidos})
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {vehiculo && (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Información del cliente y vehículo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Cliente</h3>
                  <p><strong>Nombre:</strong> {vehiculo.cliente?.nombres} {vehiculo.cliente?.apellidos}</p>
                  <p><strong>Teléfono:</strong> {vehiculo.cliente?.telefono}</p>
                  <p><strong>Correo:</strong> {vehiculo.cliente?.correo}</p>
                  <p><strong>Estado:</strong> {vehiculo.cliente?.estado}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Vehículo</h3>
                  <p><strong>Placa:</strong> {vehiculo.placa}</p>
                  <p><strong>Marca:</strong> {vehiculo.marca}</p>
                  <p><strong>Modelo:</strong> {vehiculo.modelo}</p>
                  <p><strong>Año:</strong> {vehiculo.anio}</p>
                  <p><strong>Kilometraje:</strong> {vehiculo.Kilometraje}</p>
                  <p><strong>Estado:</strong> {vehiculo.estado}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historial de reparaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getExpediente(vehiculo.id_vehiculo).map((exp, idx) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p><strong>Fecha:</strong> {exp.fecha}</p>
                        <p><strong>¿Qué se le hizo?:</strong> {exp.descripcion}</p>
                        {exp.observaciones && <p><strong>Observaciones:</strong> {exp.observaciones}</p>}
                        {exp.mecanico && <p><strong>Mecánico:</strong> {exp.mecanico}</p>}
                      </div>
                      <div>
                        <p><strong>Costo:</strong> ${Number(exp.costo || 0).toFixed(2)}</p>
                        <p><strong>Mano de obra:</strong> ${Number(exp.manoObra || 0).toFixed(2)}</p>
                        {exp.cantidad && <p><strong>Cantidad:</strong> {exp.cantidad}</p>}
                        <p className="font-semibold"><strong>Total:</strong> ${exp.total.toFixed(2)}</p>
                        {exp.orden && (
                          <>
                            <p><strong>Folio de orden:</strong> {exp.orden.folio}</p>
                            <p><strong>Falla reportada:</strong> {exp.orden.falla_reportada}</p>
                            <p><strong>Diagnóstico:</strong> {exp.orden.diagnostico}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {getExpediente(vehiculo.id_vehiculo).length === 0 && (
                  <p className="text-center py-4 text-muted-foreground">No hay reparaciones registradas</p>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
