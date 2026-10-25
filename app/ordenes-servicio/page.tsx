"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function OrdenesServicioPage() {
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [vehiculos, setVehiculos] = useState<any[]>([]);
  const [pagos, setPagos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordenesAbiertasHoy, setOrdenesAbiertasHoy] = useState(0);

  const [form, setForm] = useState({
    folio: "",
    id_vehiculo: "",
    fecha_ingreso: new Date().toISOString().split("T")[0],
    falla_reportada: "",
    diagnostico: "",
    estado: "abierta",
    precio_cot: "",
    precio_f: "",
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const supabase = createClient();
    const today = new Date().toISOString().split("T")[0];

    const { data: ordenesData } = await supabase
      .from("ordenes")
      .select("*, vehiculo(*, cliente(*))")
      .order("id_ordenes", { ascending: false });

    const { data: vehiculosData } = await supabase
      .from("vehiculo")
      .select("*, cliente(*)")
      .order("id_vehiculo");

    const { data: pagosData } = await supabase.from("pagos").select("*");

    setOrdenes(ordenesData || []);
    setVehiculos(vehiculosData || []);
    setPagos(pagosData || []);

    const count = (ordenesData || []).filter(
      (o) => o.fecha_ingreso === today && o.estado && o.estado.toLowerCase().includes("abier")
    ).length;
    setOrdenesAbiertasHoy(count);
    setLoading(false);
  };

  const getPagado = (idOrden: number) => {
    return pagos
      .filter((p) => p.id_ordenes === idOrden)
      .reduce((sum, p) => sum + Number(p.monto || 0), 0);
  };

  const agregarOrden = async (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toISOString().split("T")[0];

    if (ordenesAbiertasHoy >= 6) {
      alert("Ya se alcanzó el límite de 6 órdenes abiertas por día.");
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.from("ordenes").insert([
      {
        folio: Number(form.folio),
        id_vehiculo: form.id_vehiculo ? Number(form.id_vehiculo) : null,
        fecha_ingreso: form.fecha_ingreso,
        falla_reportada: form.falla_reportada,
        diagnostico: form.diagnostico,
        estado: form.estado,
        precio_cot: form.precio_cot ? Number(form.precio_cot) : null,
        precio_f: form.precio_f ? Number(form.precio_f) : null,
      },
    ]);

    if (error) {
      alert("Error al agregar orden: " + error.message);
      return;
    }
    alert("Orden agregada correctamente");
    setForm({
      folio: "",
      id_vehiculo: "",
      fecha_ingreso: today,
      falla_reportada: "",
      diagnostico: "",
      estado: "abierta",
      precio_cot: "",
      precio_f: "",
    });
    cargarDatos();
  };

  if (loading) {
    return <p>Cargando...</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Órdenes de servicio</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Órdenes abiertas hoy: {ordenesAbiertasHoy} / 6</CardTitle>
        </CardHeader>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Agregar nueva orden</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={agregarOrden} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="folio">Folio</Label>
                <Input
                  id="folio"
                  type="number"
                  value={form.folio}
                  onChange={(e) => setForm({ ...form, folio: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="id_vehiculo_orden">Vehículo</Label>
                <select
                  id="id_vehiculo_orden"
                  className="w-full border rounded-md p-2"
                  value={form.id_vehiculo}
                  onChange={(e) => setForm({ ...form, id_vehiculo: e.target.value })}
                >
                  <option value="">Seleccione un vehículo</option>
                  {vehiculos.map((v) => (
                    <option key={v.id_vehiculo} value={v.id_vehiculo}>
                      {v.placa} - {v.marca} {v.modelo} ({v.cliente?.nombres} {v.cliente?.apellidos})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="fecha_ingreso">Fecha de ingreso</Label>
                <Input
                  id="fecha_ingreso"
                  type="date"
                  value={form.fecha_ingreso}
                  onChange={(e) => setForm({ ...form, fecha_ingreso: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="estado">Estado</Label>
                <select
                  id="estado"
                  className="w-full border rounded-md p-2"
                  value={form.estado}
                  onChange={(e) => setForm({ ...form, estado: e.target.value })}
                >
                  <option value="abierta">Abierta</option>
                  <option value="en proceso">En proceso</option>
                  <option value="espera de pago">Espera de pago</option>
                  <option value="pagado">Pagado</option>
                  <option value="liberado">Liberado</option>
                </select>
              </div>
              <div>
                <Label htmlFor="precio_cot">Precio cotizado</Label>
                <Input
                  id="precio_cot"
                  type="number"
                  step="0.01"
                  value={form.precio_cot}
                  onChange={(e) => setForm({ ...form, precio_cot: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="precio_f">Precio final</Label>
                <Input
                  id="precio_f"
                  type="number"
                  step="0.01"
                  value={form.precio_f}
                  onChange={(e) => setForm({ ...form, precio_f: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="falla_reportada">Falla reportada</Label>
              <Input
                id="falla_reportada"
                value={form.falla_reportada}
                onChange={(e) => setForm({ ...form, falla_reportada: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="diagnostico">Diagnóstico</Label>
              <Input
                id="diagnostico"
                value={form.diagnostico}
                onChange={(e) => setForm({ ...form, diagnostico: e.target.value })}
              />
            </div>
            <Button type="submit" disabled={ordenesAbiertasHoy >= 6}>
              {ordenesAbiertasHoy >= 6 ? "Límite alcanzado (6/6)" : "Agregar orden"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Listado de órdenes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Folio</th>
                  <th className="text-left p-2">Cliente</th>
                  <th className="text-left p-2">Vehículo</th>
                  <th className="text-left p-2">Placa</th>
                  <th className="text-left p-2">Fecha ingreso</th>
                  <th className="text-left p-2">Estado</th>
                  <th className="text-left p-2">Precio final</th>
                  <th className="text-left p-2">Pagado</th>
                  <th className="text-left p-2">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {ordenes.map((o) => {
                  const pagado = getPagado(o.id_ordenes);
                  const precioF = Number(o.precio_f || 0);
                  const saldo = precioF - pagado;
                  return (
                    <tr key={o.id_ordenes} className="border-b hover:bg-muted/50">
                      <td className="p-2">{o.folio}</td>
                      <td className="p-2">
                        {o.vehiculo?.cliente?.nombres} {o.vehiculo?.cliente?.apellidos}
                      </td>
                      <td className="p-2">
                        {o.vehiculo?.marca} {o.vehiculo?.modelo}
                      </td>
                      <td className="p-2">{o.vehiculo?.placa}</td>
                      <td className="p-2">{o.fecha_ingreso}</td>
                      <td className="p-2">{o.estado}</td>
                      <td className="p-2">${precioF.toFixed(2)}</td>
                      <td className="p-2">${pagado.toFixed(2)}</td>
                      <td className="p-2">${saldo.toFixed(2)}</td>
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
