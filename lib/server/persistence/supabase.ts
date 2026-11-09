import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { generateId } from "../crypto";
import type {
  NameCardRecord,
  OrderRecord,
} from "../types";
import type { Persistence } from "./types";

function mapOrder(row: Record<string, unknown>): OrderRecord {
  return {
    id: String(row.id),
    status: row.status as OrderRecord["status"],
    englishName: String(row.english_name),
    genderPreference: row.gender_preference as OrderRecord["genderPreference"],
    desiredFeeling: row.desired_feeling as OrderRecord["desiredFeeling"],
    amountUsd: String(row.amount_usd),
    currency: String(row.currency),
    resultTokenHash: String(row.result_token_hash),
    resultExpiresAt: String(row.result_expires_at),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    waffoSessionId: (row.waffo_session_id as string) ?? null,
    waffoCheckoutUrl: (row.waffo_checkout_url as string) ?? null,
    waffoExpiresAt: (row.waffo_expires_at as string) ?? null,
    waffoOrderId: (row.waffo_order_id as string) ?? null,
    waffoPaymentId: (row.waffo_payment_id as string) ?? null,
    buyerEmail: (row.buyer_email as string) ?? null,
    fulfilledAt: (row.fulfilled_at as string) ?? null,
    emailSentAt: (row.email_sent_at as string) ?? null,
    emailError: (row.email_error as string) ?? null,
    failureCode: (row.failure_code as string) ?? null,
  };
}

export function createSupabasePersistence(
  url: string,
  serviceRoleKey: string,
): Persistence {
  const sb: SupabaseClient = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return {
    async insertRateLimitEvent(ipHash, at) {
      const id = generateId();
      const { data, error } = await sb
        .from("free_rate_limit_events")
        .insert({ id, ip_hash: ipHash, created_at: at.toISOString() })
        .select()
        .single();
      if (error) throw error;
      return {
        id: data.id,
        ipHash: data.ip_hash,
        createdAt: data.created_at,
      };
    },

    async listRateLimitEvents(ipHash, since) {
      const { data, error } = await sb
        .from("free_rate_limit_events")
        .select("*")
        .eq("ip_hash", ipHash)
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((r) => ({
        id: r.id,
        ipHash: r.ip_hash,
        createdAt: r.created_at,
      }));
    },

    async countRateLimitEventsSince(ipHash, since) {
      const { count, error } = await sb
        .from("free_rate_limit_events")
        .select("*", { count: "exact", head: true })
        .eq("ip_hash", ipHash)
        .gte("created_at", since.toISOString());
      if (error) throw error;
      return count ?? 0;
    },

    async countRateLimitEventsUtcDay(ipHash, dayStartUtc) {
      const end = new Date(dayStartUtc.getTime() + 24 * 60 * 60 * 1000);
      const { count, error } = await sb
        .from("free_rate_limit_events")
        .select("*", { count: "exact", head: true })
        .eq("ip_hash", ipHash)
        .gte("created_at", dayStartUtc.toISOString())
        .lt("created_at", end.toISOString());
      if (error) throw error;
      return count ?? 0;
    },

    async earliestRateLimitEventSince(ipHash, since) {
      const { data, error } = await sb
        .from("free_rate_limit_events")
        .select("*")
        .eq("ip_hash", ipHash)
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        id: data.id,
        ipHash: data.ip_hash,
        createdAt: data.created_at,
      };
    },

    async createOrder(order) {
      const row = {
        id: order.id,
        status: order.status,
        english_name: order.englishName,
        gender_preference: order.genderPreference,
        desired_feeling: order.desiredFeeling,
        amount_usd: order.amountUsd,
        currency: order.currency,
        result_token_hash: order.resultTokenHash,
        result_expires_at: order.resultExpiresAt,
        created_at: order.createdAt,
        updated_at: order.updatedAt ?? order.createdAt,
        waffo_session_id: order.waffoSessionId ?? null,
        waffo_checkout_url: order.waffoCheckoutUrl ?? null,
        waffo_expires_at: order.waffoExpiresAt ?? null,
        waffo_order_id: order.waffoOrderId ?? null,
        waffo_payment_id: order.waffoPaymentId ?? null,
        buyer_email: order.buyerEmail ?? null,
        fulfilled_at: order.fulfilledAt ?? null,
        email_sent_at: order.emailSentAt ?? null,
        email_error: order.emailError ?? null,
        failure_code: order.failureCode ?? null,
      };
      const { data, error } = await sb.from("orders").insert(row).select().single();
      if (error) throw error;
      return mapOrder(data);
    },

    async updateOrder(id, patch) {
      const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (patch.status !== undefined) row.status = patch.status;
      if (patch.englishName !== undefined) row.english_name = patch.englishName;
      if (patch.genderPreference !== undefined)
        row.gender_preference = patch.genderPreference;
      if (patch.desiredFeeling !== undefined)
        row.desired_feeling = patch.desiredFeeling;
      if (patch.waffoSessionId !== undefined)
        row.waffo_session_id = patch.waffoSessionId;
      if (patch.waffoCheckoutUrl !== undefined)
        row.waffo_checkout_url = patch.waffoCheckoutUrl;
      if (patch.waffoExpiresAt !== undefined)
        row.waffo_expires_at = patch.waffoExpiresAt;
      if (patch.waffoOrderId !== undefined) row.waffo_order_id = patch.waffoOrderId;
      if (patch.waffoPaymentId !== undefined)
        row.waffo_payment_id = patch.waffoPaymentId;
      if (patch.buyerEmail !== undefined) row.buyer_email = patch.buyerEmail;
      if (patch.fulfilledAt !== undefined) row.fulfilled_at = patch.fulfilledAt;
      if (patch.emailSentAt !== undefined) row.email_sent_at = patch.emailSentAt;
      if (patch.emailError !== undefined) row.email_error = patch.emailError;
      if (patch.failureCode !== undefined) row.failure_code = patch.failureCode;
      if (patch.resultExpiresAt !== undefined)
        row.result_expires_at = patch.resultExpiresAt;

      const { data, error } = await sb
        .from("orders")
        .update(row)
        .eq("id", id)
        .select()
        .maybeSingle();
      if (error) throw error;
      return data ? mapOrder(data) : null;
    },

    async getOrderById(id) {
      const { data, error } = await sb
        .from("orders")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data ? mapOrder(data) : null;
    },

    async getOrderByTokenHash(hash) {
      const { data, error } = await sb
        .from("orders")
        .select("*")
        .eq("result_token_hash", hash)
        .maybeSingle();
      if (error) throw error;
      return data ? mapOrder(data) : null;
    },

    async getOrderByWaffoOrderId(waffoOrderId) {
      const { data, error } = await sb
        .from("orders")
        .select("*")
        .eq("waffo_order_id", waffoOrderId)
        .maybeSingle();
      if (error) throw error;
      return data ? mapOrder(data) : null;
    },

    async insertNameCards(rows) {
      if (rows.length === 0) return;
      const payload = rows.map((c) => ({
        id: c.id,
        order_id: c.orderId,
        rank: c.rank,
        hanzi: c.hanzi,
        pinyin: c.pinyin,
        phonetic_hint: c.phoneticHint,
        why_it_fits_you: c.whyItFitsYou,
        self_introduction: c.selfIntroduction,
        audio_url: c.audioUrl,
      }));
      const { error } = await sb.from("name_cards").insert(payload);
      if (error) throw error;
    },

    async listNameCards(orderId) {
      const { data, error } = await sb
        .from("name_cards")
        .select("*")
        .eq("order_id", orderId)
        .order("rank", { ascending: true });
      if (error) throw error;
      return (data ?? []).map(
        (r): NameCardRecord => ({
          id: r.id,
          orderId: r.order_id,
          rank: r.rank,
          hanzi: r.hanzi,
          pinyin: r.pinyin,
          phoneticHint: r.phonetic_hint,
          whyItFitsYou: r.why_it_fits_you,
          selfIntroduction: r.self_introduction,
          audioUrl: r.audio_url,
        }),
      );
    },

    async countNameCards(orderId) {
      const { count, error } = await sb
        .from("name_cards")
        .select("*", { count: "exact", head: true })
        .eq("order_id", orderId);
      if (error) throw error;
      return count ?? 0;
    },

    async insertWebhookEvent(event) {
      const { data, error } = await sb
        .from("webhook_events")
        .insert({
          event_type: event.eventType,
          event_id: event.eventId,
          payload: event.payload,
          received_at: event.receivedAt,
          processed_at: event.processedAt,
        })
        .select()
        .maybeSingle();
      if (error) {
        if (error.code === "23505") {
          const existing = await this.getWebhookEvent(
            event.eventType,
            event.eventId,
          );
          return { inserted: false, record: existing! };
        }
        throw error;
      }
      return {
        inserted: true,
        record: {
          eventType: data!.event_type,
          eventId: data!.event_id,
          payload: data!.payload,
          receivedAt: data!.received_at,
          processedAt: data!.processed_at,
        },
      };
    },

    async markWebhookProcessed(eventType, eventId) {
      const { error } = await sb
        .from("webhook_events")
        .update({ processed_at: new Date().toISOString() })
        .eq("event_type", eventType)
        .eq("event_id", eventId);
      if (error) throw error;
    },

    async getWebhookEvent(eventType, eventId) {
      const { data, error } = await sb
        .from("webhook_events")
        .select("*")
        .eq("event_type", eventType)
        .eq("event_id", eventId)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        eventType: data.event_type,
        eventId: data.event_id,
        payload: data.payload,
        receivedAt: data.received_at,
        processedAt: data.processed_at,
      };
    },
  };
}
