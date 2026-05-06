import { useMemo, useState } from "react";
import { calculate, fmt, fmtTL, type Inputs } from "@/lib/inventory";
import {
  Boxes, Trophy, TrendingUp, TrendingDown,
  RotateCcw, Coins, Wrench, Percent, ChevronRight, ShoppingCart, Factory,
  ChevronUp, ChevronDown,
} from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

const DEFAULTS: Inputs = { D: 3200, S: 75, C: 18, K: 400, C2: 17, i: 0.22 };
type FieldKey = keyof Inputs;


const LEFT: { key: FieldKey; label: string; unit: string }[] = [
  { key: "D", label: "Yıllık Talep (D)", unit: "adet/yıl" },
  { key: "S", label: "Sipariş Maliyeti (S)", unit: "$/sipariş" },
  { key: "C", label: "Birim Dış Satın Alma (C)", unit: "$/adet" },
];
const RIGHT: { key: FieldKey; label: string; unit: string; step?: number }[] = [
  { key: "K", label: "Üretim Kurulum (K)", unit: "$/kurulum" },
  { key: "C2", label: "Birim Üretim (C₂)", unit: "$/adet" },
  { key: "i", label: "Elde Tutma Oranı (i)", unit: "%/yıl", step: 0.01 },
];

function ParamInput({ field, value, onChange }: any) {
  return (
    <div className="bg-secondary/70 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 hover:bg-secondary transition">
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{field.unit}</div>
        <div className="text-sm font-semibold text-foreground truncate">{field.label}</div>
      </div>
      <input
        type="number"
        step={field.step ?? 1}
        value={field.key === "i" ? Number(value.toFixed(4)) : value}
        onChange={(e) => {
          const v = parseFloat(e.target.value) || 0;
          onChange(v);
        }}
        className="w-28 bg-card rounded-xl px-3 py-2 text-right font-display font-bold text-foreground outline-none focus:ring-2 focus:ring-accent/40"
      />
    </div>
  );
}

const Index = () => {
  const [inp, setInp] = useState<Inputs>(DEFAULTS);
  const set = (k: FieldKey, v: number) => setInp((p) => ({ ...p, [k]: v }));
  const r = useMemo(() => calculate(inp), [inp]);

  const buyWins = r.winner === "buy";
  const winnerName = buyWins ? "Satın Alma Sistemi" : "Üretim Sistemi";

  const compareData = [
    { name: "Satın Alma", Toplam: Math.round(r.buy.total), fill: "hsl(var(--foreground))" },
    { name: "Üretim", Toplam: Math.round(r.prod.total), fill: "hsl(var(--accent))" },
  ];
  const distDataBuy = [
    { name: "Sipariş", value: Math.round(r.buy.orderCost) },
    { name: "Elde Tutma", value: Math.round(r.buy.hold) },
    { name: "Satın Alma", value: Math.round(r.buy.buyCost) },
  ];
  const distDataProd = [
    { name: "Kurulum", value: Math.round(r.prod.setupCost) },
    { name: "Elde Tutma", value: Math.round(r.prod.hold) },
    { name: "Üretim", value: Math.round(r.prod.prodCost) },
  ];
  const distColors = ["hsl(var(--foreground))", "hsl(var(--accent))", "hsl(220 13% 70%)"];

  const sensData = useMemo(() => {
    const arr: any[] = [];
    for (let f = 0.6; f <= 1.41; f += 0.1) {
      const D = Math.round(inp.D * f);
      const c = calculate({ ...inp, D });
      arr.push({ D: `${Math.round(f * 100)}%`, "Satın Alma": Math.round(c.buy.total), "Üretim": Math.round(c.prod.total) });
    }
    return arr;
  }, [inp]);

  const scenarios = [
    { icon: Coins,        label: "Birim Satın Alma Fiyatı %15 Azalırsa", run: () => setInp({ D: 3200, S: 75, C: 15.30, K: 400, C2: 17,    i: 0.22 }) },
    { icon: TrendingDown, label: "Talep %20 Azalırsa",                   run: () => setInp({ D: 2560, S: 75, C: 18,    K: 400, C2: 17,    i: 0.22 }) },
    { icon: Factory,      label: "Satın Alma Fiyatı %15 Azalırsa",       run: () => setInp({ D: 3200, S: 75, C: 18,    K: 400, C2: 19.55, i: 0.22 }) },
    { icon: TrendingUp,   label: "Talep %20 Artarsa",                    run: () => setInp({ D: 3840, S: 75, C: 18,    K: 400, C2: 17,    i: 0.22 }) },
    { icon: Wrench,       label: "Birim Üretim Fiyatı %15 Azalırsa",    run: () => setInp({ D: 3200, S: 75, C: 18,    K: 480, C2: 17,    i: 0.22 }) },
  ];

  const lower = buyWins ? r.buy.total : r.prod.total;
  const higher = buyWins ? r.prod.total : r.buy.total;

  return (
    <div className="min-h-screen bg-background p-3 md:p-6">
      {/* Top Nav */}
      <header className="flex items-center gap-4 mb-6 px-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-accent grid place-items-center shadow-lg">
            <Boxes className="w-6 h-6 text-accent-foreground" />
          </div>
          <div className="font-display font-extrabold tracking-tight text-foreground text-lg">ABC Şirketi</div>
        </div>
      </header>

      {/* Top Row: Parameters (big card) + Quick Scenario list */}
      <section className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6 mb-6">
        <div className="bg-card rounded-[32px] p-8 relative overflow-hidden">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-secondary grid place-items-center shrink-0">
                <Boxes className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
                  ABC Şirketi Operasyonel Maliyet Optimizasyonu
                </h1>
                <p className="text-base text-muted-foreground mt-2 max-w-md">
                  Üretim mi, Satın Alma mı? Parametreleri değiştir, en doğru kararı birlikte verelim.
                </p>
              </div>
            </div>
            <button
              onClick={() => setInp(DEFAULTS)}
              className="bg-secondary rounded-full px-4 py-2 text-xs font-semibold text-foreground flex items-center gap-2 hover:bg-secondary/70"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Varsayılan
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
                <ShoppingCart className="w-3 h-3" /> Satın Alma
              </div>
              {LEFT.map((f) => <ParamInput key={f.key} field={f} value={inp[f.key]} onChange={(v: number) => set(f.key, v)} />)}
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
                <Factory className="w-3 h-3" /> Üretim
              </div>
              {RIGHT.map((f) => <ParamInput key={f.key} field={f} value={inp[f.key]} onChange={(v: number) => set(f.key, v)} />)}
            </div>
          </div>

          {/* Big winner pill */}
          <div className="mt-8 flex items-center gap-3 bg-foreground text-background rounded-full pl-2 pr-6 py-2 w-fit">
            <span className="bg-accent text-accent-foreground text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">Kazanan</span>
            <Trophy className="w-4 h-4 text-accent" />
            <span className="font-display font-bold text-sm">{winnerName}</span>
            <span className="text-background/60 text-xs">·  %{r.ratio.toFixed(1)} tasarruf</span>
          </div>
        </div>

        {/* Quick Scenario card list */}
        <aside className="bg-card rounded-[32px] p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-bold text-foreground text-lg">Hızlı Senaryo</h3>
            <button onClick={() => setInp(DEFAULTS)} className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground">Temizle</button>
          </div>
          <div className="space-y-2">
            {scenarios.map((s) => (
              <button
                key={s.label}
                onClick={s.run}
                className="w-full flex items-center gap-3 bg-secondary/70 hover:bg-secondary rounded-2xl px-4 py-3 transition group"
              >
                <div className="w-9 h-9 rounded-xl bg-card grid place-items-center shrink-0">
                  <s.icon className="w-4 h-4 text-foreground" />
                </div>
                <span className="text-sm font-semibold text-foreground flex-1 text-left">{s.label}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
              </button>
            ))}
          </div>
        </aside>
      </section>

      {/* Result Cards Row */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Buy */}
        <div className={`bg-card rounded-[32px] p-7 ${buyWins ? "ring-2 ring-accent/40" : ""}`}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-secondary grid place-items-center">
                <ShoppingCart className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <div className="font-display font-bold text-foreground text-xl">Satın Alma Sistemi</div>
                <div className="text-xs text-muted-foreground">Dış tedarikçiden alım</div>
              </div>
            </div>
            {buyWins ? (
              <div className="w-9 h-9 rounded-full bg-accent grid place-items-center"><ChevronUp className="w-4 h-4 text-accent-foreground" /></div>
            ) : (
              <div className="w-9 h-9 rounded-full bg-secondary grid place-items-center"><ChevronDown className="w-4 h-4 text-foreground" /></div>
            )}
          </div>
          <div className="font-display text-4xl font-extrabold text-foreground tracking-tight">{fmtTL(r.buy.total)}</div>
          <div className="text-xs text-muted-foreground mb-5">Toplam yıllık maliyet</div>
          <div className="space-y-2.5 text-sm">
            {[
              ["Sipariş Miktarı (Q)", `${fmt(r.buy.Q)} adet`],
              ["Sipariş Sayısı (N)", fmt(r.buy.N)],
              ["Yıllık Sipariş Maliyeti", fmtTL(r.buy.orderCost)],
              ["Yıllık Elde Tutma Maliyeti", fmtTL(r.buy.hold)],
              ["Yıllık Satın Alma Maliyeti", fmtTL(r.buy.buyCost)],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between">
                <span className="text-muted-foreground">{l}</span>
                <span className="font-semibold text-foreground">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Prod */}
        <div className={`bg-card rounded-[32px] p-7 ${!buyWins ? "ring-2 ring-accent/40" : ""}`}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-accent/15 grid place-items-center">
                <Factory className="w-5 h-5 text-accent" />
              </div>
              <div>
                <div className="font-display font-bold text-foreground text-xl">Üretim Sistemi</div>
                <div className="text-xs text-muted-foreground">İç üretim hattı</div>
              </div>
            </div>
            {!buyWins ? (
              <div className="w-9 h-9 rounded-full bg-accent grid place-items-center"><ChevronUp className="w-4 h-4 text-accent-foreground" /></div>
            ) : (
              <div className="w-9 h-9 rounded-full bg-secondary grid place-items-center"><ChevronDown className="w-4 h-4 text-foreground" /></div>
            )}
          </div>
          <div className="font-display text-4xl font-extrabold text-foreground tracking-tight">{fmtTL(r.prod.total)}</div>
          <div className="text-xs text-muted-foreground mb-5">Toplam yıllık maliyet</div>
          <div className="space-y-2.5 text-sm">
            {[
              ["Üretim Miktarı (Qp)", `${fmt(r.prod.Qp)} adet`],
              ["Üretim Sayısı (Np)", fmt(r.prod.Np)],
              ["Yıllık Kurulum Maliyeti", fmtTL(r.prod.setupCost)],
              ["Yıllık Elde Tutma Maliyeti", fmtTL(r.prod.hold)],
              ["Yıllık Üretim Maliyeti", fmtTL(r.prod.prodCost)],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between">
                <span className="text-muted-foreground">{l}</span>
                <span className="font-semibold text-foreground">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison */}
        <div className="bg-foreground text-background rounded-[32px] p-7 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-accent/20 blur-2xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-accent grid place-items-center">
                  <Trophy className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <div className="font-display font-bold">Karşılaştırma</div>
                  <div className="text-xs text-background/60">Optimal sistem</div>
                </div>
              </div>
            </div>
            <div className="text-sm font-medium text-background/80 mb-1">Kazanan Sistem</div>
            <div className="font-display text-4xl font-extrabold mb-5">{winnerName}</div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-background/10 rounded-2xl p-4">
                <div className="text-[10px] uppercase tracking-wider text-background/60">Maliyet Farkı</div>
                <div className="font-display text-lg font-extrabold mt-1">{fmtTL(r.diff)}</div>
              </div>
              <div className="bg-accent rounded-2xl p-4 text-accent-foreground">
                <div className="text-[10px] uppercase tracking-wider opacity-80">Kazanç Oranı</div>
                <div className="font-display text-lg font-extrabold mt-1">%{r.ratio.toFixed(2)}</div>
              </div>
            </div>


          </div>
        </div>
      </section>

      {/* Charts Row */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card rounded-[32px] p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-display font-bold text-foreground">Toplam Maliyet Karşılaştırması</div>
              <div className="text-xs text-muted-foreground">Sistemler arası fark</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={compareData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`} />
              <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid hsl(var(--border))" }} formatter={(v: number) => fmtTL(v)} />
              <Bar dataKey="Toplam" radius={[16, 16, 0, 0]}>
                {compareData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-[32px] p-6">
          <div className="font-display font-bold text-foreground mb-1">Satın Alma Dağılımı</div>
          <div className="text-xs text-muted-foreground mb-3">Satın alma bileşenleri</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={distDataBuy} dataKey="value" nameKey="name" innerRadius={55} outerRadius={88} paddingAngle={4}>
                {distDataBuy.map((_, i) => <Cell key={i} fill={distColors[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid hsl(var(--border))" }} formatter={(v: number) => fmtTL(v)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-[32px] p-6">
          <div className="font-display font-bold text-foreground mb-1">Üretim Dağılımı</div>
          <div className="text-xs text-muted-foreground mb-3">Üretim bileşenleri</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={distDataProd} dataKey="value" nameKey="name" innerRadius={55} outerRadius={88} paddingAngle={4}>
                {distDataProd.map((_, i) => <Cell key={i} fill={distColors[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid hsl(var(--border))" }} formatter={(v: number) => fmtTL(v)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
};

export default Index;
