"use client";
import { useState, useEffect } from 'react';
import CharacterCard from '../components/CharacterCard';

export default function Home() {
  const [characters, setCharacters] = useState([]);
  // CHANGE 1: Set defaults to CN and grim-batol
  const [form, setForm] = useState({ region: 'cn', realm: 'grim-batol', name: '' });

  // Load followed characters on mount
  useEffect(() => {
    fetch('/api/characters')
      .then(res => res.json())
      .then(data => setCharacters(data));
  }, []);

  // Handle adding a new character
  const handleAdd = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/characters', {
        method: 'POST',
        body: JSON.stringify(form)
    });
    
    // Parse the response immediately
    const result = await res.json();

    if (res.ok) {
        result.wishlist = []; 
        setCharacters([...characters, result]);
        setForm({ ...form, name: '' }); 
    } else {
        // Show the specific error from the server
        alert(result.error || "An unknown error occurred");
    }
  };

  const handleDelete = async (id) => {
      await fetch(`/api/characters?id=${id}`, { method: 'DELETE' });
      setCharacters(characters.filter(c => c.id !== id));
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">My WoW Roster</h1>

        {/* Add Character Form */}
        <div className="bg-white p-4 rounded shadow mb-8 flex gap-4 justify-center">
            <select 
                className="border p-2 rounded text-black" 
                value={form.region} 
                onChange={e => setForm({...form, region: e.target.value})}
            >
                {/* CHANGE 2: Added CN as the first option */}
                <option value="cn">CN</option>
                <option value="us">US</option>
                <option value="eu">EU</option>
                <option value="tw">TW</option>
                <option value="kr">KR</option>
            </select>
            <input 
                className="border p-2 rounded text-black" 
                placeholder="Realm" 
                value={form.realm}
                onChange={e => setForm({...form, realm: e.target.value})}
            />
            <input 
                className="border p-2 rounded text-black" 
                placeholder="Character Name" 
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
            />
            <button onClick={handleAdd} className="bg-blue-600 text-white px-6 rounded hover:bg-blue-700">
                Track Character
            </button>
        </div>

        {/* Grid of Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {characters.map(char => (
                <CharacterCard key={char.id} dbCharacter={char} onDelete={handleDelete} />
            ))}
        </div>
      </div>
    </main>
  );
}