"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SignatureData } from "@/types/signature";

interface SignatureFormProps {
  onGenerate: (data: SignatureData) => void;
}

interface FieldError {
  name?: string;
  role?: string;
  email?: string;
}

export function SignatureForm({ onGenerate }: SignatureFormProps) {
  const [form, setForm] = useState<SignatureData>({
    name: "",
    role: "",
    department: "",
    phone: "",
    email: "",
  });

  const [errors, setErrors] = useState<FieldError>({});

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FieldError]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function validate(): boolean {
    const newErrors: FieldError = {};
    if (!form.name.trim()) newErrors.name = "Nome é obrigatório.";
    if (!form.role.trim()) newErrors.role = "Cargo é obrigatório.";
    if (!form.email.trim()) {
      newErrors.email = "E-mail é obrigatório.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Informe um e-mail válido.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) onGenerate(form);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="name">
          Nome completo <span className="text-red-600">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Ex: Maria da Silva"
          aria-describedby={errors.name ? "name-error" : undefined}
          aria-invalid={!!errors.name}
          className={
            errors.name ? "border-red-500 focus-visible:ring-red-400" : ""
          }
        />
        {errors.name && (
          <p id="name-error" className="text-xs text-red-600">
            {errors.name}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="role">
          Cargo / Função <span className="text-red-600">*</span>
        </Label>
        <Input
          id="role"
          name="role"
          value={form.role}
          onChange={handleChange}
          placeholder="Ex: Coordenadora Pedagógica"
          aria-describedby={errors.role ? "role-error" : undefined}
          aria-invalid={!!errors.role}
          className={
            errors.role ? "border-red-500 focus-visible:ring-red-400" : ""
          }
        />
        {errors.role && (
          <p id="role-error" className="text-xs text-red-600">
            {errors.role}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="department">Setor / Departamento</Label>
        <Input
          id="department"
          name="department"
          value={form.department}
          onChange={handleChange}
          placeholder="Ex: Ensino Médio"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone">Telefone direto</Label>
        <Input
          id="phone"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Ex: (24) 3355-1389"
          type="tel"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">
          E-mail institucional <span className="text-red-600">*</span>
        </Label>
        <Input
          id="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Ex: maria.silva@salesiano.br"
          type="email"
          aria-describedby={errors.email ? "email-error" : undefined}
          aria-invalid={!!errors.email}
          className={
            errors.email ? "border-red-500 focus-visible:ring-red-400" : ""
          }
        />
        {errors.email && (
          <p id="email-error" className="text-xs text-red-600">
            {errors.email}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full font-semibold bg-blue-900 hover:bg-blue-800 cursor-pointer text-white hover:text-white"
      >
        Gerar assinatura
      </Button>
    </form>
  );
}
