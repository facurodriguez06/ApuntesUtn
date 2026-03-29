export function UTNLogo({ className = "", ...props }: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 120" 
      fill="currentColor" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* UTN Insignia - stylized cross with curved top arms */}
      <path d="
        M 35 0
        C 35 20, 15 25, 0 30
        L 0 45
        L 35 45
        L 35 75
        L 0 75
        L 0 90
        C 15 95, 35 100, 35 120
        L 65 120
        C 65 100, 85 95, 100 90
        L 100 75
        L 65 75
        L 65 45
        L 100 45
        L 100 30
        C 85 25, 65 20, 65 0
        Z
      " />
    </svg>
  );
}
