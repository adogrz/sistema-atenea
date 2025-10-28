import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper"

export type InlineStepperStep = {
  title: string
}

interface InlineStepperProps {
  steps: InlineStepperStep[]
  activeIndex?: number
  onChange?: (nextIndex: number) => void
  className?: string
  itemClassName?: string
  separatorClassName?: string
}

export default function InlineStepper({
  steps,
  activeIndex = 0,
  onChange,
  className,
  itemClassName,
  separatorClassName,
}: InlineStepperProps) {
  const value1Based = (activeIndex ?? 0) + 1

  return (
    <div className={className}>
      <Stepper
        value={value1Based}
        onValueChange={(v) => onChange?.(Math.max(0, v - 1))}
        orientation="horizontal"
      >
        {steps.map((s, idx) => {
          const stepNumber = idx + 1
          return (
            <StepperItem
              key={stepNumber}
              step={stepNumber}
              className={itemClassName ?? "not-last:flex-1 max-md:items-start"}
            >
              <StepperTrigger className="rounded max-md:flex-col">
                <StepperIndicator />
                <div className="text-center md:text-left">
                  <StepperTitle>{s.title}</StepperTitle>
                </div>
              </StepperTrigger>
              {stepNumber < steps.length && (
                <StepperSeparator className={separatorClassName ?? "max-md:mt-3.5 md:mx-4"} />
              )}
            </StepperItem>
          )
        })}
      </Stepper>
    </div>
  )
}
