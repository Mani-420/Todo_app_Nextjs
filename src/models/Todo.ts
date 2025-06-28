import mongoose, { Schema, Document, models } from 'mongoose';

export interface ITodo extends Document {
  title: string;
  userId: string;
  completed: boolean;
  createdAt: Date;
}

const TodoSchema = new Schema<ITodo>(
  {
    title: { type: String, required: true },
    userId: { type: String, required: true },
    completed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  },
  {
    timestamps: true
  }
);

export const Todo = models.Todo || mongoose.model<ITodo>('Todo', TodoSchema);
