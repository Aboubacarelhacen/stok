export interface Inputs {
  D: number; S: number; C: number; K: number; C2: number; i: number;
}

export function calculate(inp: Inputs) {
  const { D, S, C, K, C2, i } = inp;
  const Q = Math.sqrt((2 * D * S) / (C * i));
  const N = D / Q;
  const orderCost = N * S;
  const holdBuy = (Q / 2) * C * i;
  const buyCost = D * C;
  const totalBuy = orderCost + holdBuy + buyCost;

  const Qp = Math.sqrt((2 * D * K) / (C2 * i));
  const Np = D / Qp;
  const setupCost = Np * K;
  const holdProd = (Qp / 2) * C2 * i;
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
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.round(n));
export const fmtTL = (n: number) => `$${fmt(n)}`;