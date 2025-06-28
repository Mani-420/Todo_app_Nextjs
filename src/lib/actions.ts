'use server';

import { auth } from '@clerk/nextjs/server';
import connectDB from './db';
import { Todo } from '@/models/todo';

export async function addTodo(formdata: FormData) {
  const { userId } = auth();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const title = formdata.get('title') as string;
  if (!title) {
    throw new Error('Title is required');
  }

  await connectDB();

  await Todo.create({
    title,
    userId,
    completed: false
  });
}
