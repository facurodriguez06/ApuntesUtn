const fs = require('fs');

let content = fs.readFileSync('components/UploadModule.tsx', 'utf8');

// The exact string to replace
let oldStr = \            {carrera !== "basicas" && (
              <div>
                <label className="flex items-center gap-1.5 text-sm font-bold text-[#3D3229] mb-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#A89F95]" /> Año
                </label>
                <select
                  value={anio}
                  onChange={(event) => handleAnioChange(event.target.value)}
                  disabled={!carrera}
                  className="w-full rounded-xl border border-[#EDE6DD] px-3.5 py-2.5 text-sm text-[#3D3229] focus:border-[#8BAA91] focus:outline-none focus:ring-2 focus:ring-[#8BAA91]/20 bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Seleccionar...</option>
                  {availableYears.map((year) => (
                    <option key={year} value={year}>
                      {yearConfig[year]?.label || \\\Año \\\\}
                    </option>
                  ))}
                </select>
              </div>
            )}\;

let newStr = \            <div>
              <label className="flex items-center gap-1.5 text-sm font-bold text-[#3D3229] mb-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#A89F95]" /> Año
              </label>
              <select
                value={anio}
                onChange={(event) => handleAnioChange(event.target.value)}
                disabled={!carrera}
                className="w-full rounded-xl border border-[#EDE6DD] px-3.5 py-2.5 text-sm text-[#3D3229] focus:border-[#8BAA91] focus:outline-none focus:ring-2 focus:ring-[#8BAA91]/20 bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Seleccionar...</option>
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {yearConfig[year]?.label || \\\Año \\\\}
                  </option>
                ))}
              </select>
            </div>\;

content = content.replace(oldStr, newStr);

fs.writeFileSync('components/UploadModule.tsx', content, 'utf8');
console.log('Fixed JSX render conditional');
