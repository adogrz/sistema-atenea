import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { usePage } from "@inertiajs/react";

// Definición de interfaces para los datos del usuario, roles y sedes
interface Role { id: number; name: string; description: string; }
interface Sede { id: number; name: string; description: string; }

interface User {
  id: number;
  name: string;
  email: string;
  roles: Role[] | string;
  role_name: string[];
  sede_name: string;
  status: string;
}

interface EditUserModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (updates: {
    name: string;
    email: string;
    status: string;
    role_name: string[];
    sede_name: string;
  }) => void;
  user: User | null;
  roles: Role[];
  sedes: Sede[];
  errors?: Record<string, string>;
}

export default function EditUserModal({
  open,
  onClose,
  onSave,
  user,
  roles,
  sedes,
  errors = {},
}: EditUserModalProps) {
  // Estados locales para manejar los campos del formulario
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("activo");
  const [selectedSede, setSelectedSede] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  // Efecto para inicializar los campos del formulario cuando se abre el modal
  // o cuando cambia el usuario seleccionado
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setStatus(user.status);
      setSelectedSede(user.sede_name);
      setSelectedRoles(
        Array.isArray(user.roles)
          ? user.roles.map(role => role.name)
          : user.roles
            ? user.roles.split(",")
            : []
      );
    }
  }, [user]);
  
  // Si no hay usuario, no renderizar el modal
  if (!user) return null;

  const session = (usePage().props as any).auth?.user;
  if (!session) {
    return null; // No renderizar si no hay usuario autenticado
  }
  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg">Editar Usuario</DialogTitle>
          </DialogHeader>

          <div className="space-y-1 pb-4 border-b border-muted">
            <p className="text-sm">
              <span className="font-semibold">ID:</span> {user.id}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
              {errors?.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label>Correo</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
              {errors?.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                </SelectContent>
              </Select>
              {errors?.status && <p className="text-sm text-red-500">{errors.status}</p>}
            </div>

            
            <div className="space-y-2">
              <Label>Sede</Label>
              <Select value={selectedSede} onValueChange={setSelectedSede}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar sede" />
                </SelectTrigger>
                <SelectContent>
                  {sedes.map((sede) => (
                    <SelectItem key={sede.name} value={sede.name}>
                      <div className="px-1 py-1">
                        <div className="font-medium">{sede.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors?.sede_name && <p className="text-sm text-red-500">{errors.sede_name}</p>}
            </div>
          </div>
            <div className="space-y-2">
              <Label>Roles</Label>
              <div className="flex flex-col gap-1 max-h-40 overflow-y-auto border rounded px-2 py-1">
                {roles.map((rol) => (
                  <label key={rol.name} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(rol.name)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRoles([...selectedRoles, rol.name]);
                        } else {
                          setSelectedRoles(selectedRoles.filter((r) => r !== rol.name));
                        }
                      }}
                    />
                    <span>
                      <span className="font-medium">{rol.description}</span>
                    </span>
                  </label>
                ))}
              </div>
              {errors?.role_name && <p className="text-sm text-red-500">{errors.role_name}</p>}
            </div>
          <DialogFooter className="pt-6">
            <Button variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button
              onClick={() => setShowConfirm(true)}
              disabled={!name || !email || !selectedRoles || !selectedSede || !status}
            >
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Confirmar cambios?</DialogTitle>
          </DialogHeader>
          <p>¿Estás seguro que deseas guardar los cambios realizados a este usuario?</p>
          <DialogFooter className="pt-4">
            <Button variant="secondary" onClick={() => setShowConfirm(false)}>Cancelar</Button>
            <Button
              onClick={() => {
                onSave({
                  name,
                  email,
                  status,
                  role_name: selectedRoles,
                  sede_name: selectedSede
                });
                setShowConfirm(false);
              }}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}