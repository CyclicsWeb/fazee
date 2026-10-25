"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PagosPage() {
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [pagos, setPagos] = useState<any[]>([]);
  const [empleado, setEmpleado] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [pagoForm, setPagoForm] = useState({
    id_ordenes: "",
    monto: "",
    metodo_pago: "",
    nota: "",
    fecha: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const data = localStorage.getItem("fazee_empleado");
      if (data) setEmpleado(JSON.parse(data));
    }
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const supabase = createClient();
    const { data: ordenesData } = await supabase
      .from("ordenes")
      .select("*, vehiculo(*, cliente(*))")
      .order("id_ordenes", { ascending: false });
    const { data: pagosData } = await supabase.from("pagos").select("*").order("id_pagos", { ascending: false });
    setOrdenes(ordenesData || []);
    setPagos(pagosData || []);
    setLoading(false);
  };

  const getPagado = (idOrden: number) => {
    return pagos
      .filter((p) => p.id_ordenes === idOrden)
      .reduce((sum, p) => sum + Number(p.monto || 0), 0);
  };

  const registrarPago = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    const { error } = await supabase.from("pagos").insert([
      {
        id_ordenes: Number(pagoForm.id_ordenes),
        monto: Number(pagoForm.monto),
        metodo_pago: pagoForm.metodo_pago,
        nota: pagoForm.nota,
        fecha: pagoForm.fecha,
        id_empleado: empleado?.id_empleado || null,
      },
    ]);

    if (error) {
      alert("Error al registrar pago: " + error.message);
      return;
    }
    alert("Pago registrado correctamente");
    setPagoForm({
      id_ordenes: "",
      monto: "",
      metodo_pago: "",
      nota: "",
      fecha: new Date().toISOString().split("T")[0],
    });
    cargarDatos();
  };

  if (loading) {
    return <p>Cargando...</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Pagos</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Registrar pago</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={registrarPago} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="id_ordenes_pago">Orden</Label>
                <select
                  id="id_ordenes_pago"
                  className="w-full border rounded-md p-2"
                  value={pagoForm.id_ordenes}
                  onChange={(e) => setPagoForm({ ...pagoForm, id_ordenes: e.target.value })}
                  required
                >
                  <option value="">Seleccione una orden</option>
                  {ordenes.map((o) => {
                    const precioF = Number(o.precio_f || 0);
                    const pagado = getPagado(o.id_ordenes);
                    const saldo = precioF - pagado;
                    return (
                      <option key={o.id_ordenes} value={o.id_ordenes}>
                        Folio {o.folio} - {o.vehiculo?.cliente?.nombres} {o.vehiculo?.cliente?.apellidos} - Saldo: ${saldo.toFixed(2)}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <Label htmlFor="monto">Monto</Label>
                <Input
                  id="monto"
                  type="number"
                  step="0.01"
                  value={pagoForm.monto}
                  onChange={(e) => setPagoForm({ ...pagoForm, monto: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="metodo_pago">Método de pago</Label>
                <Input
                  id="metodo_pago"
                  value={pagoForm.metodo_pago}
                  onChange={(e) => setPagoForm({ ...pagoForm, metodo_pago: e.target.value })}
                  placeholder="Efectivo, Tarjeta, Transferencia..."
                />
              </div>
              <div>
                <Label htmlFor="fecha_pago">Fecha</Label>
                <Input
                  id="fecha_pago"
                  type="date"
                  value={pagoForm.fecha}
                  onChange={(e) => setPagoForm({ ...pagoForm, fecha: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="nota">Nota</Label>
              <Input
                id="nota"
                value={pagoForm.nota}
                onChange={(e) => setPagoForm({ ...pagoForm, nota: e.target.value })}
              />
            </div>
            <Button type="submit">Registrar pago</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial de pagos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">ID Pago</th>
                  <th className="text-left p-2">Folio Orden</th>
                  <th className="text-left p-2">Cliente</th>
                  <th className="text-left p-2">Monto</th>
                  <th className="text-left p-2">Fecha</th>
                  <th className="text-left p-2">Método</th>
                  <th className="text-left p-2">Nota</th>
                </tr>
              </thead>
              <tbody>
                {pagos.map((p) => {
                  const orden = ordenes.find((o) => o.id_ordenes === p.id_ordenes);
                  return (
                    <tr key={p.id_pagos} className="border-b hover:bg-muted/50">
                      <td className="p-2">{p.id_pagos}</td>
                      <td className="p-2">{orden?.folio}</td>
                      <td className="p-2">
                        {orden?.vehiculo?.cliente?.nombres} {orden?.vehiculo?.cliente?.apellidos}
                      </td>
                      <td className="p-2">${Number(p.monto).toFixed(2)}</td>
                      <td className="p-2">{p.fecha}</td>
                      <td className="p-2">{p.metodo_pago}</td>
                      <td className="p-2">{p.nota}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
