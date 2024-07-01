  import mongoose from "mongoose";

  const userSchema = new mongoose.Schema(
    {
      firstname: {
        type: String,
        required: true,
      },
      middlename: {
        type: String,
      },
      lastname: {
        type: String,
        required: true,
      },
      username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
      },
      password: {
        type: String,
        required: true,
      },
      department: {
        type: String,
        required: true,
      },
      profilePicture: {
        type: String,
        default:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Windows_10_Default_Profile_Picture.svg/1200px-Windows_10_Default_Profile_Picture.svg.png",
      },
      role: {
        type: String,
        enum: ["superAdmin", "admin", "staff"],
        default: "staff",
      },
    },
    { timestamps: true }
  );

  const User = mongoose.model("User", userSchema);

  export default User;
