'use client';

import { useFormStatus } from 'react-dom';
import { addTodo } from '@/lib/actions';

export default function TodoForm() {
  const { pending } = useFormStatus();

  return (
    <form action={addTodo} className="flex gap-2 mt-4">
      <input
        name="title"
        placeholder="Enter a new todo"
        className="border px-2 py-1 rounded w-full"
        required
      />
      <button
        type="submit"
        disabled={pending}
        className="bg-blue-500 text-white px-4 py-1 rounded"
      >
        {pending ? 'Adding...' : 'Add'}
      </button>
    </form>
  );
}
