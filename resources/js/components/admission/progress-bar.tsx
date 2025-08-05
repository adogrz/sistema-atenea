"use client"

import { Progress } from "@/components/ui/progress"

interface BarraProgresoProps {
  progress: number
}

export default function BarraProgreso({ progress }: BarraProgresoProps) {
  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Progreso del formulario</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="w-full" />
    </div>
  )
}