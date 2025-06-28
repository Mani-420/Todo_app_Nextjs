import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import { Todo } from '@/models/Todo';
import TodoForm from '@/components/TodoForm';

export default async function DashboardPage() {
  const { userId } = auth();
  if (!userId) return <div>Please sign in</div>;

  await connectDB();
  const todos = await Todo.find({ userId }).sort({ createdAt: -1 });

  return (
    <main className="max-w-xl mx-auto mt-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Your Todos</h1>
      <TodoForm />
      <ul className="mt-6 space-y-2">
        {todos.map((todo) => (
          <li
            key={todo._id.toString()}
            className="border rounded p-2 flex justify-between"
          >
            <span>{todo.title}</span>
            <span>{todo.completed ? '✅' : '🕒'}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
