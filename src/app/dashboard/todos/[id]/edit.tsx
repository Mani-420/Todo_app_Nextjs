import { Todo } from '@/models/Todo';
import connectDB from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { updateTodo } from '@/lib/actions';
import { redirect } from 'next/navigation';

interface Props {
  params: { id: string };
}

export default async function EditTodoPage({ params }: Props) {
  const { userId } = auth();
  if (!userId) return <div>Unauthorized</div>;

  await connectDB();
  const todo = await Todo.findOne({ _id: params.id, userId });

  if (!todo) {
    redirect('/dashboard');
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-4">
      <h2 className="text-xl font-bold mb-4">Edit Todo</h2>

      <form
        action={async (formData) => {
          'use server';
          await updateTodo(params.id, formData);
          redirect('/dashboard');
        }}
        className="space-y-4"
      >
        <input
          type="text"
          name="title"
          defaultValue={todo.title}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Update Todo
        </button>
      </form>
    </div>
  );
}
