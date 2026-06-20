import type { Ticket } from "./types";
import { HOUR1_TICKETS } from "./hour1";

export const ALL_TICKETS: Ticket[] = [...HOUR1_TICKETS];

export function getTicket(id: string): Ticket | undefined {
  return ALL_TICKETS.find((t) => t.id === id);
}
export function ticketsForHour(hourSlug: string): Ticket[] {
  return ALL_TICKETS.filter((t) => t.hourSlug === hourSlug);
}

export * from "./types";
