const fs = require('fs');
let code = fs.readFileSync('app/admin/page.tsx', 'utf8');

const stateInsertion = `  const [metrics, setMetrics] = useState({ pageViews: 0, uniqueVisitors: 0, todayViews: 0 });`;
code = code.replace(
  '  const [isLoggingIn, setIsLoggingIn] = useState(false);',
  `  const [isLoggingIn, setIsLoggingIn] = useState(false);\n${stateInsertion}`
);

const metricsHook = `    // Listen for metrics
    const unsubscribeMetrics = onSnapshot(collection(db, "metrics"), (snapshot) => {
      let totalViews = 0;
      let totalUnique = 0;
      let todayViews = 0;
      const todayString = new Date().toISOString().split('T')[0];

      snapshot.forEach(d => {
        const data = d.data();
        if (d.id === "total") {
          totalViews = data.pageViews || 0;
          totalUnique = data.uniqueVisitors || 0;
        } else if (d.id === todayString) {
          todayViews = data.pageViews || 0;
        }
      });
      setMetrics({ pageViews: totalViews, uniqueVisitors: totalUnique, todayViews });
    });`;

const returnUnsub = `    return () => {
      unsubscribePending();
      unsubscribeApproved();
      unsubscribeSettings();
      unsubscribeAdmins();
      unsubscribeMetrics();
    };`;

code = code.replace(
  `    return () => {
      unsubscribePending();
      unsubscribeApproved();
      unsubscribeSettings();
      unsubscribeAdmins();
    };`,
  `${metricsHook}\n\n${returnUnsub}`
);

const insertionPoint = `        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setShowCreateAdmin(!showCreateAdmin)}`;

const dashboardHTML = `        <div className="flex flex-col sm:flex-row gap-3">
          {/* Métricas */}
          <div className="flex gap-4 sm:mr-4 bg-white border border-[#EDE6DD] rounded-xl p-3 shadow-sm min-w-max hidden lg:flex">
            <div className="pr-4 border-r border-[#EDE6DD]">
              <p className="text-[10px] font-extrabold text-[#A89F95] uppercase tracking-wider mb-0.5">Visitas Hoy</p>
              <p className="text-xl font-black text-[#2C2825] leading-none">{metrics.todayViews}</p>
            </div>
            <div className="pr-4 border-r border-[#EDE6DD]">
              <p className="text-[10px] font-extrabold text-[#A89F95] uppercase tracking-wider mb-0.5">Vistas Totales</p>
              <p className="text-xl font-black text-[#2C2825] leading-none">{metrics.pageViews}</p>
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-[#A89F95] uppercase tracking-wider mb-0.5">Visitas ÚNICA</p>
              <p className="text-xl font-black text-[#4A7A52] leading-none">{metrics.uniqueVisitors}</p>
            </div>
          </div>

          <button
            onClick={() => setShowCreateAdmin(!showCreateAdmin)}`;

code = code.replace(insertionPoint, dashboardHTML);

fs.writeFileSync('app/admin/page.tsx', code);
