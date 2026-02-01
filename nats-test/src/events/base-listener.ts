import { Message, Stan } from "node-nats-streaming";
import { Subjects } from "./subjects";

interface Event {
  subject: Subjects;
  data: any;
}

// Abstract class for a NATS event listener
// Cannot be instantiated directly — must be extended by a subclass

export abstract class Listener<T extends Event> {
  // Abstract properties: every subclass MUST define these
  abstract subject: T["subject"]; // the NATS subject (topic) this listener listens to
  abstract queueGroupName: string; // queue group name for load balancing
  abstract onMessage(data: T["data"], msg: Message): void; // method to handle incoming messages

  // Private property: only accessible inside this class
  private client: Stan; // NATS (Stan) client instance used for subscribing

  // Protected property: accessible inside this class and subclasses
  protected ackWait = 5 * 1000; // 5 seconds to acknowledge messages

  // Constructor: must provide a NATS client when creating a subclass
  constructor(client: Stan) {
    this.client = client; // store client in private property
  }

  // Method to configure subscription options for NATS
  subscriptionOptions() {
    return this.client
      .subscriptionOptions()
      .setManualAckMode(true) // require manual ack of messages
      .setAckWait(this.ackWait) // wait time before message is redelivered
      .setDurableName(this.queueGroupName); // durable subscription: remembers last processed message
  }

  // Main method to start listening to NATS messages
  listen() {
    const subscription = this.client.subscribe(
      this.subject, // topic
      this.queueGroupName, // queue group
      this.subscriptionOptions(), // subscription options
    );

    // Event handler for when a message arrives
    subscription.on("message", (msg: Message) => {
      console.log(`Received message: ${this.subject} / ${this.queueGroupName}`);

      // Parse the message into JSON
      const parsedData = this.parseMessage(msg);
      console.log(`Parsed data: ${JSON.stringify(parsedData)}`);

      // Call the subclass's implementation of onMessage
      this.onMessage(parsedData, msg);

      // Automatically ack the message after processing
      msg.ack();
    });
  }

  // Helper method to parse incoming NATS messages
  parseMessage(msg: Message) {
    const data = msg.getData();
    return typeof data === "string"
      ? JSON.parse(data) // if message is a string
      : JSON.parse(data.toString("utf8")); // if message is a buffer
  }
}
