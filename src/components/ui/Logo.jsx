import { useState } from "react";
import { Leaf } from "lucide-react";
import logoImg from "../../assets/Logo.png";

function Logo({ className = "", size = 48, showText = true }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {!imgError ? (
        <img
          src={logoImg}
          alt="Parivartan CRM Logo"
          style={{ width: size }}
          className="h-auto object-contain"
          onError={() => setImgError(true)}
        />
      ) : (
        <div style={{ width: size, height: size }} className="bg-secondary text-primary rounded-lg flex items-center justify-center">
          <Leaf size={size * 0.6} fill="currentColor" />
        </div>
      )}
      {showText && (
        <div className="flex flex-col border-l-2 border-white/30 pl-3">
          <span className="font-black text-white leading-none tracking-tight" style={{ fontSize: size > 40 ? "22px" : "18px" }}>
            Parivartan
          </span>
          <span className="font-bold text-white tracking-[0.2em] mt-1" style={{ fontSize: size > 40 ? "11px" : "9px" }}>
            CRM Portal
          </span>
        </div>
      )}
    </div>
  );
}

export default Logo;
