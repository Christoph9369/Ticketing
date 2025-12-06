import nats, { Message } from "node-nats-streaming";
import { randomBytes } from "crypto";

console.clear();

const stan = nats.connect(
  "ticketing", // clusterId
  `listener-client-${randomBytes(4).toString("hex")}`, // unique clientId
  {
    url: "http://localhost:4222",
  }
);

stan.on("connect", () => {
  console.log("Listener connected to NATS");
  stan.on("close", () => {
    console.log("NATS connection closed!");
    process.exit();
  });
  const options = stan
    .subscriptionOptions()
    .setManualAckMode(true)
    .setDeliverAllAvailable()
    .setDurableName("ticket-service");

  const subscription = stan.subscribe(
    "ticket:created",
    "order-service-queue-group", // queue group
    options
  );

  subscription.on("message", (msg: Message) => {
    const data = msg.getData();

    if (typeof data === "string") {
      console.log(`Received event #${msg.getSequence()} with data: ${data}`);
    }

    msg.ack(); // <-- important when manual ack is enabled
  });
});
process.on("SIGINT", () => stan.close());
process.on("SIGTERM", () => stan.close());
