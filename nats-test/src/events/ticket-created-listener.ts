import { Message } from "node-nats-streaming";
import { Listener } from "./base-listener";

import { TicketCreatedEvent } from "./ticket-created-events";
import { Subjects } from "./subjects";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName = "order-service-queue-group";

  onMessage(data: TicketCreatedEvent["data"], msg: Message) {
    console.log(
      `Processing ticket:created event with data: ${JSON.stringify(data)}`,
    );
  }
}
