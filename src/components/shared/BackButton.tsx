import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  label?: string;
  href?: string;
  className?: string;
}

export function BackButton({ label = "Back", href, className }: BackButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (href) {
      navigate(href);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 text-primary hover:text-gold transition-colors duration-200 group min-h-[44px] min-w-[44px] ${className || ''}`}
    >
      <ArrowLeft
        size={18}
        className="group-hover:-translate-x-1 transition-transform duration-200"
      />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
