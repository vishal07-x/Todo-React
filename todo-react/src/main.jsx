import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const STORAGE_KEY = 'react-todo-assignment-v1';

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadTodos() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function expandInput(rawTitle) {
  const value = rawTitle.trim();
  if (!value) return [];

  const match = value.match(/^(.*?)(?:\s+(\d+))?$/);
  const title = (match?.[1] || value).trim();
  const requestedCount = Number(match?.[2] || 1);
  const count = Math.min(Math.max(requestedCount, 1), 20);

  return Array.from({ length: count }, () => ({
    id: makeId(),
    title,
    updateCount: 0,
    completed: false,
  }));
}

function TodoItem({ todo, onToggle, onEdit, onDelete }) {
  const suffix = todo.updateCount === 1 ? 'time' : 'times';

  return (
    <li className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <button className="check" onClick={() => onToggle(todo.id)} aria-label={`Mark ${todo.title} complete`}>
        {todo.completed ? '✓' : ''}
      </button>
      <div className="todo-content">
        <div className="todo-title">{todo.title}</div>
        <div className="todo-meta">Updated {todo.updateCount} {suffix}</div>
      </div>
      <div className="actions">
        <button className="secondary" onClick={() => onEdit(todo)}>Edit</button>
        <button className="danger" onClick={() => onDelete(todo.id)}>Delete</button>
      </div>
    </li>
  );
}

function App() {
  const [todos, setTodos] = useState(loadTodos);
  const [input, setInput] = useState('');
  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const remaining = useMemo(() => todos.filter((todo) => !todo.completed).length, [todos]);

  function addTodos(event) {
    event.preventDefault();
    const newTodos = expandInput(input);
    if (!newTodos.length) return;
    setTodos((current) => [...current, ...newTodos]);
    setInput('');
  }

  function toggleTodo(id) {
    setTodos((current) => current.map((todo) => todo.id === id ? { ...todo, completed: !todo.completed } : todo));
  }

  function openEdit(todo) {
    setEditing(todo);
    setEditValue(todo.title);
  }

  function saveEdit(event) {
    event.preventDefault();
    const title = editValue.trim();
    if (!editing || !title) return;
    setTodos((current) => current.map((todo) => todo.id === editing.id
      ? { ...todo, title, updateCount: todo.updateCount + 1 }
      : todo));
    setEditing(null);
    setEditValue('');
  }

  function deleteTodo(id) {
    setTodos((current) => current.filter((todo) => todo.id !== id));
  }

  function clearCompleted() {
    setTodos((current) => current.filter((todo) => !todo.completed));
  }

  return (
    <main className="page">
      <section className="app-shell">
        <header className="hero">
          <div><p className="eyebrow">REACT ASSIGNMENT</p><h1>Todo Tracker</h1><p className="subtitle">Add, edit, delete and track every task update.</p></div>
          <div className="stats"><strong>{remaining}</strong><span>active</span></div>
        </header>

        <form className="add-form" onSubmit={addTodos}>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g. Make Food 3" aria-label="Task name" />
          <button type="submit">Add Task</button>
        </form>
        <p className="hint">Tip: entering <b>Make Food 3</b> creates three separate “Make Food” tasks.</p>

        <div className="toolbar"><span>{todos.length} total task{todos.length === 1 ? '' : 's'}</span><button className="link-btn" onClick={clearCompleted} disabled={!todos.some((todo) => todo.completed)}>Clear completed</button></div>

        {todos.length === 0 ? <div className="empty">No tasks yet. Add your first task above.</div> : (
          <ul className="todo-list">{todos.map((todo) => <TodoItem key={todo.id} todo={todo} onToggle={toggleTodo} onEdit={openEdit} onDelete={deleteTodo} />)}</ul>
        )}
      </section>

      {editing && <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setEditing(null)}>
        <form className="modal" onSubmit={saveEdit}>
          <h2>Edit task</h2><p>Saving this edit increases the update counter by 1.</p>
          <input autoFocus value={editValue} onChange={(e) => setEditValue(e.target.value)} />
          <div className="modal-actions"><button type="button" className="secondary" onClick={() => setEditing(null)}>Cancel</button><button type="submit">Save edit</button></div>
        </form>
      </div>}
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
