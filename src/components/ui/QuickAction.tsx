import { Link } from "react-router-dom";

interface QuickActionProps {
  icon: React.ElementType;
  label: string;
  secondaryLabel?: string;
  to?: string;
}

export const QuickAction = ({ icon: Icon, label, secondaryLabel, to }: QuickActionProps) => {
  const content = (
    <div className="flex flex-col items-center gap-2 text-white text-center">
      <div className="w-16 h-16 bg-[#27272a] rounded-full flex items-center justify-center transition-transform hover:scale-105">
        <Icon size={28} />
      </div>
      <div className="text-xs font-medium leading-tight">
        <span>{label}</span>
        {secondaryLabel && <><br /><span>{secondaryLabel}</span></>}
      </div>
    </div>
  );

  return to ? (
    <Link to={to} className="flex flex-col items-center">
      {content}
    </Link>
  ) : (
    <button className="flex flex-col items-center">
      {content}
    </button>
  );
};
