import mongoose from "mongoose";
import { Password } from "../services/password";

// 1️⃣ Attributes required to create a user
interface UserAttrs {
  email: string;
  password: string;
}

// 2️⃣ Properties of a User document
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

// 3️⃣ Properties of the User model
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

// 4️⃣ Define the schema
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(_doc, ret: any) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password; // ❌ Never expose password in responses
        delete ret.__v;
      },
    },
  }
);

// 5️⃣ Hash password before saving if modified
userSchema.pre("save", async function (done) {
  // Only hash if the password was changed OR new
  if (this.isModified("password")) {
    const hashed = await Password.toHash(this.get("password"));
    this.set("password", hashed);
  }
  done();
});

// 6️⃣ Add custom build method for type checking
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

// 7️⃣ Create and export model
const User = mongoose.model<UserDoc, UserModel>("User", userSchema);

export { User };
