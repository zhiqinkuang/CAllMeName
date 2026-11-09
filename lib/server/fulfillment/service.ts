import { generateId } from "../crypto";
import type { Clock } from "../clock";
import type { EmailClient } from "../email/types";
import type { LlmClient } from "../llm/types";
import {
  assertNoFortuneTelling,
  generatePaidNameBases,
} from "../names/generator";
import type { Persistence } from "../persistence/types";
import type { FullCard, NameCardRecord } from "../types";

const MAX_LLM_ATTEMPTS = 2; // initial + 1 retry

export type FulfillmentService = {
  fulfillOrder(orderId: string, rawResultToken: string): Promise<void>;
};

export function createFulfillmentService(deps: {
  persistence: Persistence;
  llm: LlmClient;
  email: EmailClient;
  clock: Clock;
  appBaseUrl: string;
}): FulfillmentService {
  const { persistence, llm, email, clock, appBaseUrl } = deps;

  return {
    async fulfillOrder(orderId, rawResultToken) {
      const order = await persistence.getOrderById(orderId);
      if (!order) return;

      // Idempotent: already ready with cards
      const existingCount = await persistence.countNameCards(orderId);
      if (order.status === "ready" && existingCount >= 3) {
        return;
      }
      if (order.status === "refunded") return;

      await persistence.updateOrder(orderId, {
        status: "fulfilling",
        updatedAt: clock.now().toISOString(),
      });

      try {
        let cards: FullCard[] | null = null;
        let lastError: unknown;

        for (let attempt = 0; attempt < MAX_LLM_ATTEMPTS; attempt++) {
          try {
            const bases = generatePaidNameBases({
              genderPreference: order.genderPreference,
              desiredFeeling: order.desiredFeeling,
              count: 3,
            });

            const full: FullCard[] = [];
            for (const base of bases) {
              let explained = await llm.explainName({
                englishName: order.englishName,
                genderPreference: order.genderPreference,
                desiredFeeling: order.desiredFeeling,
                hanzi: base.hanzi,
                pinyin: base.pinyin,
                phoneticHint: base.phoneticHint,
              });

              // Safety: must not rewrite hanzi; no fortune-telling
              if (
                !explained.selfIntroduction.includes(base.hanzi) ||
                !assertNoFortuneTelling(
                  explained.whyItFitsYou + explained.selfIntroduction,
                )
              ) {
                // Resample once inside attempt by regenerating this card
                const retryBases = generatePaidNameBases({
                  genderPreference: order.genderPreference,
                  desiredFeeling: order.desiredFeeling,
                  count: 1,
                });
                const rb = retryBases[0]!;
                explained = await llm.explainName({
                  englishName: order.englishName,
                  genderPreference: order.genderPreference,
                  desiredFeeling: order.desiredFeeling,
                  hanzi: rb.hanzi,
                  pinyin: rb.pinyin,
                  phoneticHint: rb.phoneticHint,
                });
                if (
                  !explained.selfIntroduction.includes(rb.hanzi) ||
                  !assertNoFortuneTelling(
                    explained.whyItFitsYou + explained.selfIntroduction,
                  )
                ) {
                  throw new Error("LLM safety filter");
                }
                full.push({
                  hanzi: rb.hanzi,
                  pinyin: rb.pinyin,
                  phoneticHint: rb.phoneticHint,
                  audioUrl: null,
                  whyItFitsYou: explained.whyItFitsYou,
                  selfIntroduction: explained.selfIntroduction,
                });
              } else {
                full.push({
                  hanzi: base.hanzi,
                  pinyin: base.pinyin,
                  phoneticHint: base.phoneticHint,
                  audioUrl: null,
                  whyItFitsYou: explained.whyItFitsYou,
                  selfIntroduction: explained.selfIntroduction,
                });
              }
            }
            cards = full;
            break;
          } catch (e) {
            lastError = e;
          }
        }

        if (!cards) {
          await persistence.updateOrder(orderId, {
            status: "failed",
            failureCode: "generation_failed",
            updatedAt: clock.now().toISOString(),
          });
          console.error("fulfillment failed", orderId, lastError);
          return;
        }

        // Avoid duplicate cards on replay
        const again = await persistence.countNameCards(orderId);
        if (again === 0) {
          const rows: NameCardRecord[] = cards.map((c, i) => ({
            id: generateId(),
            orderId,
            rank: (i + 1) as 1 | 2 | 3,
            ...c,
            audioUrl: null,
          }));
          await persistence.insertNameCards(rows);
        }

        const fulfilledAt = clock.now().toISOString();
        await persistence.updateOrder(orderId, {
          status: "ready",
          fulfilledAt,
          updatedAt: fulfilledAt,
        });

        const latest = (await persistence.getOrderById(orderId))!;
        if (latest.buyerEmail && !latest.emailSentAt) {
          try {
            const saved = await persistence.listNameCards(orderId);
            await email.sendResultEmail({
              to: latest.buyerEmail,
              resultUrl: `${appBaseUrl}/results/${rawResultToken}`,
              cards: saved.map((c) => ({
                hanzi: c.hanzi,
                pinyin: c.pinyin,
                phoneticHint: c.phoneticHint,
                selfIntroduction: c.selfIntroduction,
              })),
            });
            await persistence.updateOrder(orderId, {
              emailSentAt: clock.now().toISOString(),
              updatedAt: clock.now().toISOString(),
            });
          } catch (e) {
            await persistence.updateOrder(orderId, {
              emailError: e instanceof Error ? e.message : "email_failed",
              updatedAt: clock.now().toISOString(),
            });
          }
        }
      } catch (e) {
        await persistence.updateOrder(orderId, {
          status: "failed",
          failureCode: "generation_failed",
          updatedAt: clock.now().toISOString(),
        });
        console.error("fulfillment unexpected", orderId, e);
      }
    },
  };
}

/** Helper for tests: sync fulfill without after() */
export async function fulfillNow(
  service: FulfillmentService,
  orderId: string,
  rawToken: string,
): Promise<void> {
  await service.fulfillOrder(orderId, rawToken);
}
