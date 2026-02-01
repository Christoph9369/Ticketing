import { Stan } from "node-nats-streaming";
import { Subjects } from "./subjects";

interface Event {
  subject: Subjects;
  data: any;
}

// Abstract class for a NATS event publisher
// Cannot be instantiated directly — must be extended by a subclass
export abstract class Publisher<T extends Event> {
  // Abstract properties: every subclass MUST define these
  abstract subject: T["subject"]; // the NATS subject (topic) this publisher publishes to

  // Private property: only accessible inside this class
  private client: Stan; // NATS (Stan) client instance used for publishing

  // Constructor: must provide a NATS client when creating a subclass
  constructor(client: Stan) {
    this.client = client; // store client in private property
  }

  // Method to publish an event to NATS
  publish(data: T["data"]) {
    return new Promise<void>((resolve, reject) => {
      this.client.publish(this.subject, JSON.stringify(data), (err) => {
        if (err) {
          console.error(`Error publishing ${this.subject}: ${err.message}`);
          return reject(err);
        }
        console.log(`Event Published to subject${this.subject}`);
        resolve();
      });
    });
  }
}
