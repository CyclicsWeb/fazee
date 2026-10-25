"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, DollarSign, Bell, Cog, Calendar } from "lucide-react";

export default function InicioPage() {
  const [stats, setStats] = useState({
    ordenesAbiertasHoy: 0,
    saldoPorCobrar: 0,
    recordatoriosPendientes: 0,
    ordenesEnProceso: 0,
    proximosRecordatorios: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    const supabase = createClient();
    const today = new Date().toISOString().split("T")[0];

    try {
      const { data: ordenesHoy } = await supabase
        .from("ordenes")
        .select("id_ordenes, estado, precio_f, fecha_ingreso");

      const ordenesAbiertasHoy = (ordenesHoy || []).filter(
        (o) => o.fecha_ingreso === today && o.estado && o.estado.toLowerCase().includes("abier")
      ).length;

      const ordenesEnProceso = (ordenesHoy || []).filter(
        (o) => o.estado && o.estado.toLowerCase().includes("proceso")
      ).length;

      const { data: pagos } = await supabase.from("pagos").select("id_ordenes, monto");
      
      const pagosPorOrden: Record<number, number> = {};
      (pagos || []).forEach((p) => {
        pagosPorOrden[p.id_ordenes] = (pagosPorOrden[p.id_ordenes] || 0) + Number(p.monto || 0);
      });

      let saldoPorCobrar = 0;
      let recordatoriosPendientes = 0;
      
      (ordenesHoy || []).forEach((o) => {
        const precioF = Number(o.precio_f || 0);
        const pagado = pagosPorOrden[o.id_ordenes] || 0;
        if (precioF > pagado) {
          saldoPorCobrar += precioF - pagado;
          recordatoriosPendientes++;
        }
      });

      setStats({
        ordenesAbiertasHoy,
        saldoPorCobrar,
        recordatoriosPendientes,
        ordenesEnProceso,
        proximosRecordatorios: recordatoriosPendientes,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p>Cargando estadísticas...</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Inicio</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Órdenes abiertas hoy</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ordenesAbiertasHoy} / 6</div>
            <p className="text-xs text-muted-foreground">Máximo 6 por día</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo por cobrar</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.saldoPorCobrar.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total pendiente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recordatorios pendientes</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recordatoriosPendientes}</div>
            <p className="text-xs text-muted-foreground">Personas que faltan de pagar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Órdenes en proceso</CardTitle>
            <Cog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ordenesEnProceso}</div>
            <p className="text-xs text-muted-foreground">En reparación</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos recordatorios</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.proximosRecordatorios}</div>
            <p className="text-xs text-muted-foreground">Por atender</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
