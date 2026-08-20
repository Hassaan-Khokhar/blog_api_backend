import mongoose from "mongoose";
const blogSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      required: true
    },
    snippet: { type: String, required: true },
    isPaid: {
      type: Boolean,
      default: false
    },
    price: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true },
);

blogSchema.index({title: 'text', snippet: 'text', body: 'text'})
const Blog = mongoose.model("Blog", blogSchema);
export default Blog;
