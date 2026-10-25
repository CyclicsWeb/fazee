"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ClientesVehiculosPage() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [vehiculos, setVehiculos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [clienteForm, setClienteForm] = useState({
    nombres: "",
    apellidos: "",
    telefono: "",
    correo: "",
    estado: "",
  });

  const [vehiculoForm, setVehiculoForm] = useState({
    placa: "",
    marca: "",
    modelo: "",
    anio: "",
    id_cliente: "",
    Kilometraje: "",
    estado: "",
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const supabase = createClient();
    const { data: clientesData } = await supabase.from("cliente").select("*").order("id_cliente");
    const { data: vehiculosData } = await supabase
      .from("vehiculo")
      .select("*, cliente(*)")
      .order("id_vehiculo");
    setClientes(clientesData || []);
    setVehiculos(vehiculosData || []);
    setLoading(false);
  };

  const agregarCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    const { error } = await supabase.from("cliente").insert([clienteForm]);
    if (error) {
      alert("Error al agregar cliente: " + error.message);
      return;
    }
    alert("Cliente agregado correctamente");
    setClienteForm({ nombres: "", apellidos: "", telefono: "", correo: "", estado: "" });
    cargarDatos();
  };

  const agregarVehiculo = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    const { error } = await supabase.from("vehiculo").insert([
      {
        ...vehiculoForm,
        anio: vehiculoForm.anio ? Number(vehiculoForm.anio) : null,
        Kilometraje: vehiculoForm.Kilometraje ? Number(vehiculoForm.Kilometraje) : null,
        id_cliente: Number(vehiculoForm.id_cliente),
      },
    ]);
    if (error) {
      alert("Error al agregar vehículo: " + error.message);
      return;
    }
    alert("Vehículo agregado correctamente");
    setVehiculoForm({
      placa: "",
      marca: "",
      modelo: "",
      anio: "",
      id_cliente: "",
      Kilometraje: "",
      estado: "",
    });
    cargarDatos();
  };

  if (loading) {
    return <p>Cargando...</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Clientes y sus vehículos</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Agregar nuevo cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={agregarCliente} className="space-y-4">
              <div>
                <Label htmlFor="nombres">Nombres</Label>
                <Input
                  id="nombres"
                  value={clienteForm.nombres}
                  onChange={(e) => setClienteForm({ ...clienteForm, nombres: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="apellidos">Apellidos</Label>
                <Input
                  id="apellidos"
                  value={clienteForm.apellidos}
                  onChange={(e) => setClienteForm({ ...clienteForm, apellidos: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={clienteForm.telefono}
                  onChange={(e) => setClienteForm({ ...clienteForm, telefono: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="correo">Correo</Label>
                <Input
                  id="correo"
                  type="email"
                  value={clienteForm.correo}
                  onChange={(e) => setClienteForm({ ...clienteForm, correo: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="estado">Estado</Label>
                <Input
                  id="estado"
                  value={clienteForm.estado}
                  onChange={(e) => setClienteForm({ ...clienteForm, estado: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full">Agregar cliente</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agregar vehículo</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={agregarVehiculo} className="space-y-4">
              <div>
                <Label htmlFor="id_cliente">Cliente</Label>
                <select
                  id="id_cliente"
                  className="w-full border rounded-md p-2"
                  value={vehiculoForm.id_cliente}
                  onChange={(e) => setVehiculoForm({ ...vehiculoForm, id_cliente: e.target.value })}
                  required
                >
                  <option value="">Seleccione un cliente</option>
                  {clientes.map((c) => (
                    <option key={c.id_cliente} value={c.id_cliente}>
                      {c.nombres} {c.apellidos}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="placa">Placa</Label>
                <Input
                  id="placa"
                  value={vehiculoForm.placa}
                  onChange={(e) => setVehiculoForm({ ...vehiculoForm, placa: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="marca">Marca</Label>
                <Input
                  id="marca"
                  value={vehiculoForm.marca}
                  onChange={(e) => setVehiculoForm({ ...vehiculoForm, marca: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="modelo">Modelo</Label>
                <Input
                  id="modelo"
                  value={vehiculoForm.modelo}
                  onChange={(e) => setVehiculoForm({ ...vehiculoForm, modelo: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="anio">Año</Label>
                  <Input
                    id="anio"
                    type="number"
                    value={vehiculoForm.anio}
                    onChange={(e) => setVehiculoForm({ ...vehiculoForm, anio: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="kilometraje">Kilometraje</Label>
                  <Input
                    id="kilometraje"
                    type="number"
                    value={vehiculoForm.Kilometraje}
                    onChange={(e) => setVehiculoForm({ ...vehiculoForm, Kilometraje: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="estado_vehiculo">Estado</Label>
                <Input
                  id="estado_vehiculo"
                  value={vehiculoForm.estado}
                  onChange={(e) => setVehiculoForm({ ...vehiculoForm, estado: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full">Agregar vehículo</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Clientes actuales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">ID</th>
                    <th className="text-left p-2">Nombres</th>
                    <th className="text-left p-2">Apellidos</th>
                    <th className="text-left p-2">Teléfono</th>
                    <th className="text-left p-2">Correo</th>
                    <th className="text-left p-2">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((c) => (
                    <tr key={c.id_cliente} className="border-b hover:bg-muted/50">
                      <td className="p-2">{c.id_cliente}</td>
                      <td className="p-2">{c.nombres}</td>
                      <td className="p-2">{c.apellidos}</td>
                      <td className="p-2">{c.telefono}</td>
                      <td className="p-2">{c.correo}</td>
                      <td className="p-2">{c.estado}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vehículos actuales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">ID</th>
                    <th className="text-left p-2">Placa</th>
                    <th className="text-left p-2">Marca</th>
                    <th className="text-left p-2">Modelo</th>
                    <th className="text-left p-2">Año</th>
                    <th className="text-left p-2">Kilometraje</th>
                    <th className="text-left p-2">Cliente</th>
                    <th className="text-left p-2">Teléfono Cliente</th>
                    <th className="text-left p-2">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {vehiculos.map((v) => (
                    <tr key={v.id_vehiculo} className="border-b hover:bg-muted/50">
                      <td className="p-2">{v.id_vehiculo}</td>
                      <td className="p-2">{v.placa}</td>
                      <td className="p-2">{v.marca}</td>
                      <td className="p-2">{v.modelo}</td>
                      <td className="p-2">{v.anio}</td>
                      <td className="p-2">{v.Kilometraje}</td>
                      <td className="p-2">
                        {v.cliente?.nombres} {v.cliente?.apellidos}
                      </td>
                      <td className="p-2">{v.cliente?.telefono}</td>
                      <td className="p-2">{v.estado}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
