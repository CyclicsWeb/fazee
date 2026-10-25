"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    const user = usuario.trim();
    const pass = contrasena.trim();

    if (!user) {
      setError("El usuario es obligatorio.");
      setIsLoading(false);
      return;
    }

    if (!pass) {
      setError("La contraseña es obligatoria.");
      setIsLoading(false);
      return;
    }

    try {
      const { data: empleado, error: empleadoError } = await supabase
        .from("empleado")
        .select("id_empleado, nombre, ap_paterno, ap_materno, rol, activo, contrasena")
        .eq("nombre", user)
        .maybeSingle();

      if (empleadoError) {
        setError("Error al conectar con Supabase.");
        setIsLoading(false);
        return;
      }

      if (!empleado) {
        const { data: empleado2 } = await supabase
          .from("empleado")
          .select("id_empleado, nombre, ap_paterno, ap_materno, rol, activo, contrasena")
          .ilike("nombre", user)
          .maybeSingle();

        if (!empleado2) {
          setError("Usuario o contraseña incorrectos.");
          setIsLoading(false);
          return;
        }

        if (empleado2.activo === false) {
          setError("Este usuario se encuentra inactivo.");
          setIsLoading(false);
          return;
        }

        if (empleado2.contrasena !== pass) {
          setError("Usuario o contraseña incorrectos.");
          setIsLoading(false);
          return;
        }

        const sessionData2 = {
          id_empleado: empleado2.id_empleado,
          nombre: empleado2.nombre,
          ap_paterno: empleado2.ap_paterno,
          ap_materno: empleado2.ap_materno,
          rol: empleado2.rol,
        };

        if (typeof window !== "undefined") {
          localStorage.setItem("fazee_empleado", JSON.stringify(sessionData2));
        }
        router.push("/inicio");
        router.refresh();
        setIsLoading(false);
        return;
      }

      if (empleado.activo === false) {
        setError("Este usuario se encuentra inactivo.");
        setIsLoading(false);
        return;
      }

      if (empleado.contrasena !== pass) {
        setError("Usuario o contraseña incorrectos.");
        setIsLoading(false);
        return;
      }

      const sessionData = {
        id_empleado: empleado.id_empleado,
        nombre: empleado.nombre,
        ap_paterno: empleado.ap_paterno,
        ap_materno: empleado.ap_materno,
        rol: empleado.rol,
      };

      if (typeof window !== "undefined") {
        localStorage.setItem("fazee_empleado", JSON.stringify(sessionData));
      }
      router.push("/inicio");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ocurrió un error al iniciar sesión.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Inicio de sesión</CardTitle>
          <CardDescription>
            Ingresa tu usuario y contraseña
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="usuario">Usuario</Label>
                <Input
                  id="usuario"
                  type="text"
                  placeholder="Ingresa tu usuario"
                  required
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  autoComplete="username"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Ingresando..." : "Ingresar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
