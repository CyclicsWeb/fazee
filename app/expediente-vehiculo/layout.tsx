"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Home,
  Users,
  ClipboardList,
  CreditCard,
  Bell,
  FileText,
  LogOut,
} from "lucide-react";

const menuItems = [
  { href: "/inicio", label: "Inicio", icon: Home },
  { href: "/clientes-vehiculos", label: "Clientes y sus vehículos", icon: Users },
  { href: "/ordenes-servicio", label: "Órdenes de servicio", icon: ClipboardList },
  { href: "/pagos", label: "Pagos", icon: CreditCard },
  { href: "/recordatorios", label: "Recordatorios", icon: Bell },
  { href: "/expediente-vehiculo", label: "Expediente del vehículo", icon: FileText },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [empleado, setEmpleado] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const data = localStorage.getItem("fazee_empleado");
      if (!data) {
        router.replace("/auth/login");
        return;
      }
      try {
        setEmpleado(JSON.parse(data));
        setLoading(false);
      } catch {
        localStorage.removeItem("fazee_empleado");
        router.replace("/auth/login");
      }
    }
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("fazee_empleado");
    }
    router.push("/auth/login");
  };

  const getRolLabel = (rol: number) => {
    if (rol === 1) return "Administrador";
    if (rol === 2) return "Editor";
    if (rol === 3) return "Consultor";
    return "Usuario";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-6 border-b border-sidebar-border">
          <h1 className="text-xl font-bold text-sidebar-foreground">FAZEE</h1>
          <p className="text-sm text-sidebar-foreground/70 mt-1">Taller Mecánico</p>
          {empleado && (
            <div className="mt-3 text-xs text-sidebar-foreground/80">
              <p className="font-medium">
                {empleado.nombre} {empleado.ap_paterno} {empleado.ap_materno}
              </p>
              <p>{getRolLabel(empleado.rol)}</p>
              <p>N° Empleado: {empleado.id_empleado}</p>
            </div>
          )}
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3",
                    isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                >
                  <Icon size={18} />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            Cerrar sesión
          </Button>
        </div>
      </aside>
      <main className="flex-1 bg-background overflow-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
