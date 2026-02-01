import mongoose from "mongoose";

/**
 * Attributes needed to create a Ticket
 */
interface TicketAttrs {
  title: string;
  price: number;
  userId: string;
}

/**
 * Ticket document interface
 */
interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  userId: string;
}

/**
 * Ticket model interface
 */
interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
}

const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  userId: {
    type: String,
    required: true,
  },
});

/**
 * Customize JSON output safely
 */
ticketSchema.set("toJSON", {
  transform(doc, ret) {
    // Cast ret once to allow controlled mutation
    const transformed = ret as {
      _id: mongoose.Types.ObjectId;
      __v?: number;
      id?: string;
    };

    transformed.id = transformed._id.toHexString();
    delete transformed.__v;

    return transformed;
  },
});

/**
 * Type-safe constructor
 */
ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket(attrs);
};

const Ticket = mongoose.model<TicketDoc, TicketModel>("Ticket", ticketSchema);

export { Ticket };
