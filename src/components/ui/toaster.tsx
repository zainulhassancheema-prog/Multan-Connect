"use client"

// Touched to re-trigger deploy sync
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      icons={{
        success: (
          <CircleCheckIcon className="size-4 text-gold" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      toastOptions={{
        style: {
          background: "#1A237E",
          color: "#FFFFFF",
          borderRadius: "16px",
          padding: "12px 16px",
          fontSize: "13px",
          fontWeight: "500",
          boxShadow: "0 8px 32px rgba(26,35,126,0.3)",
          border: "1px solid rgba(201,151,58,0.2)",
        },
        classNames: {
          toast: "cn-toast",
          success: "!text-white",
          error: "!bg-[#D32F2F] !shadow-[0_8px_32px_rgba(211,47,47,0.3)] !border-transparent",
        },
      }}
      duration={3000}
      {...props}
    />
  )
}

export { Toaster }
