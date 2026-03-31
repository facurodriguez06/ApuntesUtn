const fs = require('fs');
let code = fs.readFileSync('app/layout.tsx', 'utf8');

// Move <Script> outside of standard component flow to just below <head> or similar standard injection.
// Next.js layout needs Script strategy beforeInteractive normally injected cleanly.
// Alternatively, since this is a Next app, putting Script inside body shouldn't trigger "Encountered script tag... " unless it's wrapped awkwardly. Let's move it to top of <body>.

const target = `            <Script id="security" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: securityScript }} />
            <InteractiveBackground />`;

const replacement = `            <InteractiveBackground />`;

code = code.replace(target, replacement);

const topBodyTarget = `      <body className="min-h-screen flex flex-col bg-[#FFFBF7] text-[#3D3229] w-full m-0 p-0 relative">`;
const topBodyReplacement = `      <head>
        <script id="security" dangerouslySetInnerHTML={{ __html: securityScript }} />
      </head>
      <body className="min-h-screen flex flex-col bg-[#FFFBF7] text-[#3D3229] w-full m-0 p-0 relative">`;

code = code.replace(topBodyTarget, topBodyReplacement);


fs.writeFileSync('app/layout.tsx', code);