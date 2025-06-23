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

interface Role { id: number; name: string; description: string; }
interface Sede { id: number; name: string; description: string; }
interface User {
  id: number;
  name: string;
  email: string;
  role_name: string;
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
    role_name: string;
    sede_name: string;
  }) => void;
  user: User | null;
  roles: Role[];
  sedes: Sede[];
}

/**
 * Renders a modal dialog for editing user details, including name, email, status, role, and sede.
 *
 * Displays a form pre-filled with the selected user's information and allows updating these fields. Shows validation errors if present. The "Guardar" button opens a confirmation dialog before saving changes. Returns `null` if no user is provided.
 *
 * @param open - Whether the modal is open
 * @param onClose - Callback to close the modal
 * @param onSave - Callback invoked with updated user data upon confirmation
 * @param user - The user to edit, or `null` to hide the modal
 * @param roles - List of available roles for selection
 * @param sedes - List of available sedes for selection
 * @returns The modal dialog component, or `null` if no user is provided
 */
export default function EditUserModal({
  open,
  onClose,
  onSave,
  user,
  roles,
  sedes,
}: EditUserModalProps) {
  const { errors } = usePage().props;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("activo");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedSede, setSelectedSede] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setStatus(user.status);
      setSelectedRole(user.role_name);
      setSelectedSede(user.sede_name);
    }
  }, [user]);

  if (!user) return null;

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
              <Label>Rol</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((rol) => (
                    <SelectItem key={rol.name} value={rol.name}>
                      <div className="px-1 py-1">
                        <div className="font-medium">{rol.description}</div>
                        <div className="text-xs text-muted-foreground">{rol.name}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors?.role_name && <p className="text-sm text-red-500">{errors.role_name}</p>}
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
                        <div className="text-xs text-muted-foreground">{sede.name}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors?.sede_name && <p className="text-sm text-red-500">{errors.sede_name}</p>}
            </div>
          </div>

          <DialogFooter className="pt-6">
            <Button variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button
              onClick={() => setShowConfirm(true)}
              disabled={!name || !email || !selectedRole || !selectedSede || !status}
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
                onSave({ name, email, status, role_name: selectedRole, sede_name: selectedSede });
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