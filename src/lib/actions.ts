'use server';

import { auth } from '@clerk/nextjs/server';
import connectDB from './db';
import { Todo } from '@/models/Todo';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function addTodo(formdata: FormData) {
  const { userId } = await auth();
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

  revalidatePath('/dashboard/todos');
}

export async function toggleTodo(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  await connectDB();
  const todo = await Todo.findOne({ _id: id, userId });
  if (!todo) return;

  todo.completed = !todo.completed;
  await todo.save();

  revalidatePath('/dashboard/todos');
}

export async function deleteTodo(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  await connectDB();
  await Todo.deleteOne({ _id: id, userId });

  revalidatePath('/dashboard/todos');
}

export async function updateTodo(id: string, formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const title = formData.get('title')?.toString().trim();
  if (!title) return;

  await connectDB();
  await Todo.findOneAndUpdate({ _id: id, userId }, { title }, { new: true });

  revalidatePath('/dashboard/todos');
  redirect('/dashboard/todos');
}
