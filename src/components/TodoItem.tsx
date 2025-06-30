'use client';

import { toggleTodo, deleteTodo } from '@/lib/actions';
import { useTransition } from 'react';

interface TodoItemProps {
  todo: {
    _id: string;
    title: string;
    completed: boolean;
    userId: string;
    createdAt: Date;
  };
}

export default function TodoItem({ todo }: TodoItemProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      await toggleTodo(todo._id);
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteTodo(todo._id);
    });
  };

  return (
    <li className="border rounded p-4 flex justify-between items-center bg-white shadow-sm">
      <span
        className={`flex-1 ${
          todo.completed ? 'line-through text-gray-500' : 'text-gray-900'
        }`}
      >
        {todo.title}
      </span>

      <div className="flex gap-2 ml-4">
        <button
          onClick={handleToggle}
          disabled={isPending}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            todo.completed
              ? 'bg-yellow-500 text-white hover:bg-yellow-600'
              : 'bg-green-500 text-white hover:bg-green-600'
          } disabled:opacity-50`}
        >
          {todo.completed ? 'Undo' : 'Done'}
        </button>

        <button
          onClick={handleDelete}
          disabled={isPending}
          className="px-3 py-1 bg-red-500 text-white rounded text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          Delete
        </button>

        <a
          href={`/dashboard/todos/${todo._id}`}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600 transition-colors"
        >
          Edit
        </a>
      </div>
    </li>
  );
}
