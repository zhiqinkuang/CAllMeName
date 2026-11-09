import { hashResultToken } from "../crypto";
import { notFound } from "../errors";
import type { Clock } from "../clock";
import type { Persistence } from "../persistence/types";
import type { FullCard, OrderStatus } from "../types";

const GENERATING: OrderStatus[] = [
  "created",
  "awaiting_payment",
  "expired",
  "paid",
  "fulfilling",
];

export type ResultsService = {
  getByToken(token: string): Promise<
    | { httpStatus: 202; body: { status: "generating" } }
    | {
        httpStatus: 200;
        body:
          | { status: "ready"; cards: FullCard[] }
          | { status: "failed"; message: string };
      }
  >;
};

export function createResultsService(deps: {
  persistence: Persistence;
  clock: Clock;
}): ResultsService {
  const { persistence, clock } = deps;

  return {
    async getByToken(token) {
      if (!token || typeof token !== "string") throw notFound();
      const hash = hashResultToken(token);
      const order = await persistence.getOrderByTokenHash(hash);
      if (!order) throw notFound();

      const now = clock.now().getTime();
      if (now > Date.parse(order.resultExpiresAt)) throw notFound();
      if (order.status === "refunded") throw notFound();

      if (order.status === "ready") {
        const rows = await persistence.listNameCards(order.id);
        if (rows.length !== 3) {
          // Still generating cards
          return { httpStatus: 202, body: { status: "generating" } };
        }
        const cards: FullCard[] = rows.map((r) => ({
          hanzi: r.hanzi,
          pinyin: r.pinyin,
          phoneticHint: r.phoneticHint,
          audioUrl: null,
          whyItFitsYou: r.whyItFitsYou,
          selfIntroduction: r.selfIntroduction,
        }));
        return { httpStatus: 200, body: { status: "ready", cards } };
      }

      if (order.status === "failed") {
        return {
          httpStatus: 200,
          body: {
            status: "failed",
            message:
              "We could not prepare your names. Please contact support with your payment email.",
          },
        };
      }

      if (GENERATING.includes(order.status)) {
        return { httpStatus: 202, body: { status: "generating" } };
      }

      throw notFound();
    },
  };
}
