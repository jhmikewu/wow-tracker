"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react"; // Import hooks
import { useRouter } from "next/navigation"; // Import router
import Dashboard from "../components/Dashboard";
import { THEMES } from "./utils/themes";

export default function Home() {
  // 1. PROTECT ROUTE
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [characters, setCharacters] = useState([]);
  const [form, setForm] = useState({ name: '', realm: 'grim-batol', region: 'cn' });
  const [isAdding, setIsAdding] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentThemeKey, setCurrentThemeKey] = useState('dark');
  const theme = THEMES[currentThemeKey];

  // Redirect if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('wow-tracker-theme');
    if (savedTheme && THEMES[savedTheme]) {
      setCurrentThemeKey(savedTheme);
    }
  }, []);

  const toggleTheme = () => {
      const newKey = currentThemeKey === 'dark' ? 'light' : 'dark';
      setCurrentThemeKey(newKey);
      localStorage.setItem('wow-tracker-theme', newKey);
  };

  // Only fetch if authenticated
  useEffect(() => {
    if (status === "authenticated") {
        fetch('/api/characters')
        .then((res) => {
            if (res.ok) return res.json();
            return [];
        })
        .then((data) => setCharacters(data));
    }
  }, [status]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    const res = await fetch('/api/characters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    
    const data = await res.json();
    setIsAdding(false);

    if (data.error) {
      alert(data.error);
    } else {
      setCharacters([...characters, data]);
      setForm({ ...form, name: '' }); 
      setIsModalOpen(false); 
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this character?')) return;
    await fetch(`/api/characters?id=${id}`, { method: 'DELETE' });
    setCharacters(characters.filter(c => c.id !== id));
  };

  // Show loading while checking auth
  if (status === "loading") return <div className="p-10 text-white">Loading...</div>;
  if (!session) return null; // Will redirect

  return (
    <div className={`min-h-screen w-fit min-w-full ${theme.bg}`}> 
      
      <div className={`${theme.panel} p-4 border-b ${theme.border} sticky top-0 z-50 shadow-md flex justify-between items-center h-16 transition-colors duration-300 min-w-full`}>
        <div className="flex items-center gap-4">
             <h1 className={`text-xl font-bold ${theme.text} pl-2`}>WoW Tracker</h1>
        </div>
        
        <div className="flex gap-4 items-center">
            <button
                onClick={toggleTheme}
                className={`p-2 rounded-full transition-all duration-300 border ${theme.border} ${theme.inputBg} hover:bg-gray-500/10 group relative`}
                title="Toggle Theme"
            >
                <div className="w-6 h-6 flex items-center justify-center">
                    {currentThemeKey === 'dark' ? (
                        <img src="https://www.svgrepo.com/show/503805/sun.svg" alt="Sun" className="w-5 h-5" />
                    ) : (
                        <img src="https://www.svgrepo.com/show/528415/moon.svg" alt="Moon" className="w-5 h-5" />
                    )}
                </div>
            </button>

            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded font-bold flex items-center gap-2 transition-colors shadow-sm"
            >
                <span className="text-lg leading-none mb-0.5">+</span> Add
            </button>

            {/* LOGOUT BUTTON */}
            <button 
                onClick={() => signOut()}
                className={`text-xs ${theme.text} hover:text-red-500 font-bold border ${theme.border} p-2 rounded hover:bg-red-500/10`}
            >
                Logout
            </button>
        </div>
      </div>

      <Dashboard characters={characters} onDelete={handleDelete} theme={theme} />

      {isModalOpen && (
        <div className={`fixed inset-0 flex items-center justify-center z-[100] backdrop-blur-sm p-4 ${theme.modalOverlay}`}>
            <div className={`${theme.panel} p-6 rounded-lg shadow-2xl border ${theme.border} w-full max-w-md relative animate-in fade-in zoom-in duration-200`}>
                <button 
                    onClick={() => setIsModalOpen(false)}
                    className={`absolute top-4 right-4 text-gray-400 hover:${theme.text} text-xl font-bold w-8 h-8 flex items-center justify-center rounded hover:bg-black/10`}
                >
                    ✕
                </button>
                
                <h2 className={`text-xl font-bold ${theme.text} mb-6 border-b ${theme.border} pb-2`}>Track New Character</h2>
                
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className={`block text-sm font-bold ${theme.textDim} mb-1`}>Region</label>
                        <select 
                            className={`w-full p-2.5 rounded ${theme.inputBg} ${theme.text} border ${theme.inputBorder} focus:border-blue-500 outline-none`}
                            value={form.region} 
                            onChange={e => setForm({...form, region: e.target.value})}
                        >
                            <option value="cn">CN (China)</option>
                            <option value="us">US / Oceania</option>
                            <option value="eu">Europe</option>
                            <option value="tw">Taiwan</option>
                            <option value="kr">Korea</option>
                        </select>
                    </div>
                    <div>
                        <label className={`block text-sm font-bold ${theme.textDim} mb-1`}>Realm</label>
                        <input 
                            className={`w-full p-2.5 rounded ${theme.inputBg} ${theme.text} border ${theme.inputBorder} focus:border-blue-500 outline-none placeholder-gray-500`} 
                            placeholder="e.g. Grim Batol" 
                            value={form.realm}
                            onChange={e => setForm({...form, realm: e.target.value})} 
                        />
                    </div>
                    <div>
                        <label className={`block text-sm font-bold ${theme.textDim} mb-1`}>Character Name</label>
                        <input 
                            className={`w-full p-2.5 rounded ${theme.inputBg} ${theme.text} border ${theme.inputBorder} focus:border-blue-500 outline-none placeholder-gray-500`} 
                            placeholder="Character Name" 
                            value={form.name}
                            onChange={e => setForm({...form, name: e.target.value})}
                            autoFocus
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={isAdding}
                        className="bg-green-600 hover:bg-green-500 text-white py-3 rounded font-bold disabled:opacity-50 mt-4 transition-colors shadow-lg"
                    >
                        {isAdding ? "Verifying..." : "Add to Tracker"}
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}