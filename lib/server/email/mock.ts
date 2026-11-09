import type { EmailClient, SendResultEmailInput } from "./types";

export function createMockEmailClient(): EmailClient & {
  sent: SendResultEmailInput[];
  failNext: boolean;
} {
  const state = {
    sent: [] as SendResultEmailInput[],
    failNext: false,
  };
  return {
    get sent() {
      return state.sent;
    },
    get failNext() {
      return state.failNext;
    },
    set failNext(v: boolean) {
      state.failNext = v;
    },
    async sendResultEmail(input) {
      if (state.failNext) {
        state.failNext = false;
        throw new Error("mock email failure");
      }
      state.sent.push(input);
    },
  };
}
