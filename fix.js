const fs = require('fs');
let content = fs.readFileSync('app/planes/page.tsx', 'utf-8');

// Fix the mouse event tracking
content = content.replace(
  /const handleMouseMove = \\(e: MouseEvent\\) => \\{[\\s\\S]*?\\};\\s*const container = containerRef.current;\\s*if \\(container\\) \\{\\s*container.addEventListener\\('mousemove', handleMouseMove\\);\\s*\\}\\s*return \\(\\) => \\{\\s*if \\(container\\) \\{\\s*container.removeEventListener\\('mousemove', handleMouseMove\\);\\s*\\}\\s*\\};/g,
  \const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };\);
    
content = content.replace(
  /bg-\\[#FDFBF7\\] /g,
  ""
);

content = content.replace(
  /bg-white\\/40 backdrop-blur-md/g,
  "bg-white/60 backdrop-blur-md relative z-20"
);

fs.writeFileSync('app/planes/page.tsx', content);
console.log('Fixed background mouse tracking and transparency');
