export interface Inputs {
  D: number; S: number; C: number; K: number; C2: number; i: number;
}

const P = 12000; // annual production rate (units/year)

// Abramowitz & Stegun approximation for the error function
function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t) * Math.exp(-x * x);
  return sign * y;
}

// Standard normal CDF: Φ(z)
function normalCDF(z: number): number {
  return 0.5 * (1 + erf(z / Math.sqrt(2)));
}

export function calculate(inp: Inputs) {
  const { D, S, C, K, C2, i } = inp;
  const Q = Math.sqrt((2 * D * S) / (C * i));
  const N = D / Q;
  const orderCost = N * S;
  const holdBuy = (Q / 2) * C * i;
  const buyCost = D * C;
  const totalBuy = orderCost + holdBuy + buyCost;

  const Qp = Math.sqrt((2 * D * K) / (C2 * i * (1 - D / P)));
  const Np = D / Qp;
  const setupCost = Np * K;
  const holdProd = ((Qp * (1 - D / P) / 2) + (normalCDF(1 / Np) * 20)) * C2 * i;
  const prodCost = D * C2;
  const totalProd = setupCost + holdProd + prodCost;

  const higher = Math.max(totalBuy, totalProd);
  const lower = Math.min(totalBuy, totalProd);
  const diff = higher - lower;
  const ratio = (diff / higher) * 100;
  const winner: "buy" | "prod" = totalBuy < totalProd ? "buy" : "prod";

  return {
    buy: { Q, N, orderCost, hold: holdBuy, buyCost, total: totalBuy },
    prod: { Qp, Np, setupCost, hold: holdProd, prodCost, total: totalProd },
    diff, ratio, winner,
  };
}

export const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n);
export const fmtDec = (n: number) =>
  new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
export const fmtTL = (n: number) => `$${fmt(n)}`;