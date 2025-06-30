import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import { Todo } from '@/models/Todo';
import TodoForm from '@/components/TodoForm';
import TodoItem from '@/components/TodoItem';

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) return <div>Please sign in</div>;

  await connectDB();
  const todos = await Todo.find({ userId }).sort({ createdAt: -1 });

  return (
    <main className="max-w-4xl mx-auto mt-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Your Todos</h1>
      <TodoForm />
      {todos.length === 0 ? (
        <div className="mt-8 text-center py-8 text-gray-500">
          <p>No todos yet. Create your first todo above!</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {todos.map((todo) => (
            <TodoItem
              key={todo._id.toString()}
              todo={{
                _id: todo._id.toString(),
                title: todo.title,
                completed: todo.completed,
                userId: todo.userId,
                createdAt: todo.createdAt
              }}
            />
          ))}
        </ul>
      )}
    </main>
  );
}
