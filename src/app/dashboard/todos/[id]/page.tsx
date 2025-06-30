import { Todo } from '@/models/Todo';
import connectDB from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { updateTodo } from '@/lib/actions';
import { redirect } from 'next/navigation';
import Link from 'next/link';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditTodoPage({ params }: Props) {
  const { userId } = await auth();
  if (!userId) return <div>Unauthorized</div>;

  const { id } = await params;
  
  await connectDB();
  const todo = await Todo.findOne({ _id: id, userId });

  if (!todo) {
    redirect('/dashboard/todos');
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Todo</h2>

        <form
          action={async (formData) => {
            'use server';
            await updateTodo(id, formData);
            redirect('/dashboard/todos');
          }}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Todo Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              defaultValue={todo.title}
              className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Update Todo
            </button>

            <Link
              href="/dashboard/todos"
              className="bg-gray-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
