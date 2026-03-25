import type { FastifyInstance } from "fastify";
import type { WebSocket } from "@fastify/websocket";

// In-memory client tracking (zone subscriptions)
const zoneSubscriptions = new Map<string, Set<WebSocket>>();
const clientZones = new Map<WebSocket, Set<string>>();

/**
 * Register WebSocket route for real-time zone updates.
 */
export async function registerRealtimeRoutes(app: FastifyInstance): Promise<void> {
  app.get("/api/v1/ws/zones", { websocket: true }, (socket, req) => {
    const ws = socket as unknown as WebSocket;

    ws.on("message", (raw) => {
      try {
        const msg = JSON.parse(raw.toString()) as {
          type: string;
          zoneIds?: string[];
        };

        switch (msg.type) {
          case "subscribe": {
            if (!msg.zoneIds) return;
            const zones = clientZones.get(ws) ?? new Set();
            for (const zoneId of msg.zoneIds) {
              zones.add(zoneId);
              if (!zoneSubscriptions.has(zoneId)) {
                zoneSubscriptions.set(zoneId, new Set());
              }
              zoneSubscriptions.get(zoneId)!.add(ws);
            }
            clientZones.set(ws, zones);
            ws.send(JSON.stringify({ type: "subscribed", zoneIds: msg.zoneIds }));
            break;
          }

          case "unsubscribe": {
            if (!msg.zoneIds) return;
            const clientZoneSet = clientZones.get(ws);
            if (clientZoneSet) {
              for (const zoneId of msg.zoneIds) {
                clientZoneSet.delete(zoneId);
                zoneSubscriptions.get(zoneId)?.delete(ws);
              }
            }
            break;
          }

          case "ping":
            ws.send(JSON.stringify({ type: "pong" }));
            break;
        }
      } catch {
        // Invalid JSON — ignore
      }
    });

    ws.on("close", () => {
      // Clean up subscriptions
      const zones = clientZones.get(ws);
      if (zones) {
        for (const zoneId of zones) {
          zoneSubscriptions.get(zoneId)?.delete(ws);
          if (zoneSubscriptions.get(zoneId)?.size === 0) {
            zoneSubscriptions.delete(zoneId);
          }
        }
      }
      clientZones.delete(ws);
    });
  });
}

/**
 * Broadcast a zone score update to all subscribed clients.
 * Call this after activity processing updates a zone's scores.
 */
export function broadcastZoneUpdate(zoneId: string, data: {
  groupId: string;
  groupName: string;
  totalAp: number;
  rank: number;
  isController: boolean;
}): void {
  const subscribers = zoneSubscriptions.get(zoneId);
  if (!subscribers || subscribers.size === 0) return;

  const message = JSON.stringify({
    type: "zone_update",
    zoneId,
    ...data,
    timestamp: new Date().toISOString(),
  });

  for (const ws of subscribers) {
    try {
      ws.send(message);
    } catch {
      // Client disconnected — will be cleaned up on close
    }
  }
}

/**
 * Broadcast territory change to all subscribed clients.
 */
export function broadcastTerritoryChange(zoneId: string, data: {
  newController: { groupId: string; name: string; color: string };
  previousController: { groupId: string; name: string } | null;
}): void {
  const subscribers = zoneSubscriptions.get(zoneId);
  if (!subscribers || subscribers.size === 0) return;

  const message = JSON.stringify({
    type: "territory_change",
    zoneId,
    ...data,
    timestamp: new Date().toISOString(),
  });

  for (const ws of subscribers) {
    try {
      ws.send(message);
    } catch {
      // Clean up on next close
    }
  }
}

/**
 * Get current connection stats.
 */
export function getRealtimeStats(): { totalClients: number; totalSubscriptions: number; activeZones: number } {
  let totalSubscriptions = 0;
  for (const subs of zoneSubscriptions.values()) {
    totalSubscriptions += subs.size;
  }

  return {
    totalClients: clientZones.size,
    totalSubscriptions,
    activeZones: zoneSubscriptions.size,
  };
}
