// Import the NATS Streaming client
import nats from "node-nats-streaming";

import { TicketCreatedPublisher } from "./events/ticket-created-publisher";

// Clear the console for cleaner logs when running the script
console.clear();

// Connect to NATS Streaming server (Stan)
const stan = nats.connect(
  "ticketing", // clusterId: NATS cluster name (must match your server)
  "publisher-client", // clientId: unique ID for this client (must be unique per connection)
  {
    url: "http://localhost:4222", // URL of the NATS server
  },
);

// Event handler for successful connection to NATS
stan.on("connect", async () => {
  console.log("Publisher connected to NATS");
  const publisher = new TicketCreatedPublisher(stan);
  try {
    await publisher.publish({
      id: "123",
      title: "concert",
      price: 20,
    });
  } catch (error) {
    console.error(`Error publishing event: ${error}`);
  }
});
