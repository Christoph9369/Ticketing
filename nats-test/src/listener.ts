import nats from "node-nats-streaming";
import { randomBytes } from "crypto";
import { TicketCreatedListener } from "./events/ticket-created-listener";

// Clear the console for cleaner logs during development
console.clear();

// 🔗 Connect to the NATS Streaming server
const stan = nats.connect(
  "ticketing", // ✅ clusterId (must match the NATS Streaming server clusterId)
  `listener-client-${randomBytes(4).toString("hex")}`, // ✅ unique clientId (required per connection)
  {
    url: "http://localhost:4222", // NATS server URL
  },
);

// Fired once the client successfully connects to NATS
stan.on("connect", () => {
  console.log("Listener connected to NATS");

  // Graceful shutdown when the connection is closed
  stan.on("close", () => {
    console.log("NATS connection closed!");
    process.exit();
  });

  // Instantiate and start the TicketCreatedListener
  new TicketCreatedListener(stan).listen();
});

// 🛑 Handle graceful shutdown when process is terminated
process.on("SIGINT", () => stan.close());
process.on("SIGTERM", () => stan.close());
