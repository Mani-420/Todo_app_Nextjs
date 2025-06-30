'use client';

import { useFormStatus } from 'react-dom';
import { addTodo } from '@/lib/actions';
import { useRef } from 'react';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? 'Adding...' : 'Add Todo'}
    </button>
  );
}

export default function TodoForm() {
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    await addTodo(formData);
    formRef.current?.reset();
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="flex gap-3 mt-4 p-4 bg-gray-50 rounded-lg"
    >
      <input
        name="title"
        placeholder="Enter a new todo..."
        className="text-black border border-gray-300 px-4 py-2 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        required
      />
      <SubmitButton />
    </form>
  );
}
