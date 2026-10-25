"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RecordatoriosPage() {
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [pagos, setPagos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const supabase = createClient();
    const { data: ordenesData } = await supabase
      .from("ordenes")
      .select("*, vehiculo(*, cliente(*))")
      .order("id_ordenes", { ascending: false });
    const { data: pagosData } = await supabase.from("pagos").select("*");
    setOrdenes(ordenesData || []);
    setPagos(pagosData || []);
    setLoading(false);
  };

  const getPagado = (idOrden: number) => {
    return pagos
      .filter((p) => p.id_ordenes === idOrden)
      .reduce((sum, p) => sum + Number(p.monto || 0), 0);
  };

  const pendientes = ordenes.filter((o) => {
    const precioF = Number(o.precio_f || 0);
    const pagado = getPagado(o.id_ordenes);
    return precioF > pagado;
  });

  if (loading) {
    return <p>Cargando...</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Recordatorios</h1>
      <p className="text-muted-foreground mb-6">Personas que faltan de pagar con sus carros</p>

      <Card>
        <CardHeader>
          <CardTitle>Clientes con saldo pendiente ({pendientes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Folio</th>
                  <th className="text-left p-2">Cliente</th>
                  <th className="text-left p-2">Teléfono</th>
                  <th className="text-left p-2">Vehículo</th>
                  <th className="text-left p-2">Placa</th>
                  <th className="text-left p-2">Fecha ingreso</th>
                  <th className="text-left p-2">Precio final</th>
                  <th className="text-left p-2">Pagado</th>
                  <th className="text-left p-2">Adeudado</th>
                </tr>
              </thead>
              <tbody>
                {pendientes.map((o) => {
                  const pagado = getPagado(o.id_ordenes);
                  const precioF = Number(o.precio_f || 0);
                  const adeudado = precioF - pagado;
                  return (
                    <tr key={o.id_ordenes} className="border-b hover:bg-muted/50">
                      <td className="p-2">{o.folio}</td>
                      <td className="p-2">
                        {o.vehiculo?.cliente?.nombres} {o.vehiculo?.cliente?.apellidos}
                      </td>
                      <td className="p-2">{o.vehiculo?.cliente?.telefono}</td>
                      <td className="p-2">
                        {o.vehiculo?.marca} {o.vehiculo?.modelo}
                      </td>
                      <td className="p-2">{o.vehiculo?.placa}</td>
                      <td className="p-2">{o.fecha_ingreso}</td>
                      <td className="p-2">${precioF.toFixed(2)}</td>
                      <td className="p-2">${pagado.toFixed(2)}</td>
                      <td className="p-2 font-semibold text-red-600">${adeudado.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {pendientes.length === 0 && (
              <p className="text-center py-4 text-muted-foreground">No hay recordatorios pendientes</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
