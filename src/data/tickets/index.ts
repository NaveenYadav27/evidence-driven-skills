import type { Ticket } from "./types";
import { HOUR1_TICKETS } from "./hour1";
import { HOUR2_TICKETS } from "./hour2";
import { HOUR3_TICKETS } from "./hour3";
import { HOUR4_TICKETS } from "./hour4";
import { HOUR5_TICKETS } from "./hour5";
import { HOUR6_TICKETS } from "./hour6";
import { HOUR7_TICKETS } from "./hour7";
import { HOUR8_TICKETS } from "./hour8";

export const ALL_TICKETS: Ticket[] = [
  ...HOUR1_TICKETS,
  ...HOUR2_TICKETS,
  ...HOUR3_TICKETS,
  ...HOUR4_TICKETS,
  ...HOUR5_TICKETS,
  ...HOUR6_TICKETS,
  ...HOUR7_TICKETS,
  ...HOUR8_TICKETS,
];

export function getTicket(id: string): Ticket | undefined {
  return ALL_TICKETS.find((t) => t.id === id);
}
export function ticketsForHour(hourSlug: string): Ticket[] {
  return ALL_TICKETS.filter((t) => t.hourSlug === hourSlug);
}

export * from "./types";
