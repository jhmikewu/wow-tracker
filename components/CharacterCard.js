"use client";
import { useState, useEffect, useCallback } from 'react';
import { getCharacterData } from '../app/utils/raiderio';

export default function CharacterCard({ dbCharacter, onDelete }) {
  const [rioData, setRioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wishlistText, setWishlistText] = useState('');
  const [wishlist, setWishlist] = useState(dbCharacter.wishlist || []);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
        const data = await getCharacterData(dbCharacter.region, dbCharacter.realm, dbCharacter.name);
        setRioData(data);
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  }, [dbCharacter]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    if (rioData) {
        const updateWowhead = () => {
            if (window.$WowheadPower) {
                window.$WowheadPower.refreshLinks();
            }
        };
        const t1 = setTimeout(updateWowhead, 200);
        const t2 = setTimeout(updateWowhead, 1000);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [rioData]);

  const addWishlist = async (e) => {
    e.preventDefault();
    if (!wishlistText) return;
    const res = await fetch('/api/wishlist', {
      method: 'POST',
      body: JSON.stringify({ characterId: dbCharacter.id, description: wishlistText }),
    });
    const newItem = await res.json();
    setWishlist([...wishlist, newItem]);
    setWishlistText('');
  };

  if (loading && !rioData) return <div className="p-4 border rounded bg-white">Loading {dbCharacter.name}...</div>;
  if (!rioData) return <div className="p-4 border rounded bg-red-50 text-red-500">Could not load {dbCharacter.name}</div>;

  return (
    <div className="border rounded-lg shadow-lg p-6 bg-white text-black relative">
      <div className="absolute top-2 right-2 flex gap-2">
        <button 
            onClick={refreshData} 
            className="text-gray-400 hover:text-blue-600 text-sm"
            title="Refresh Data"
        >
            {loading ? "..." : "↻ Refresh"}
        </button>
        <button 
            onClick={() => onDelete(dbCharacter.id)} 
            className="text-gray-400 hover:text-red-600 font-bold px-2"
            title="Remove Character"
        >
            X
        </button>
      </div>
      
      <div className="flex items-center gap-4 mb-4">
        <img src={rioData.thumbnail_url} alt="Avatar" className="w-12 h-12 rounded-full border" />
        <div>
          <h2 className="text-xl font-bold capitalize">{rioData.name}</h2>
          <p className="text-sm text-gray-600">{rioData.race} {rioData.class} - {rioData.active_spec_name}</p>
        </div>
        <div className="ml-auto text-right mr-8">
            <div className="text-2xl font-bold text-purple-600">{rioData.mythic_plus_scores_by_season[0].scores.all}</div>
            <div className="text-xs text-gray-500">IO Score</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gear Section */}
        <div className="bg-gray-50 p-3 rounded">
          <h3 className="font-bold mb-2 text-sm uppercase text-gray-500">Equipped Gear ({rioData.gear.item_level_equipped})</h3>
          <div className="space-y-1 text-sm">
            {/* CHANGE: Filter out shirts and tabards */}
            {Object.entries(rioData.gear.items)
                .filter(([slot]) => slot !== 'shirt' && slot !== 'tabard') 
                .map(([slot, item]) => (
              <div key={item.item_id} className="flex justify-between items-center">
                 <a 
                    href={`https://www.wowhead.com/cn/item=${item.item_id}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="hover:underline font-medium truncate pr-2" 
                    data-wh-rename-link="true"
                 >
                   {item.name}
                 </a>
                 <span className="text-gray-500 text-xs whitespace-nowrap">{item.item_level}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Best Runs Section */}
        <div className="bg-gray-50 p-3 rounded">
          <h3 className="font-bold mb-2 text-sm uppercase text-gray-500">Best Season Runs</h3>
          <div className="space-y-2 text-sm">
             {rioData.mythic_plus_best_runs.map((run, i) => (
                 <div key={i} className="flex justify-between items-center border-b pb-1 last:border-0">
                     <a href={run.url} target="_blank" className="hover:underline font-medium text-blue-600">
                         {run.short_name} (+{run.mythic_level})
                     </a>
                     <span className="text-gray-500">{run.num_keystone_upgrades > 0 ? `+${run.num_keystone_upgrades}` : '-'}</span>
                 </div>
             ))}
          </div>
        </div>
      </div>

      {/* Wishlist Section */}
      <div className="mt-4 pt-4 border-t">
         <h3 className="font-bold mb-2 text-sm">Wishlist / Goals</h3>
         <ul className="list-disc pl-5 text-sm mb-2">
             {wishlist.map(item => (
                 <li key={item.id}>{item.description}</li>
             ))}
         </ul>
         <form onSubmit={addWishlist} className="flex gap-2">
             <input 
                className="border p-1 text-sm flex-grow rounded" 
                placeholder="Add goal or item..." 
                value={wishlistText}
                onChange={e => setWishlistText(e.target.value)}
             />
             <button type="submit" className="bg-green-600 text-white text-sm px-3 rounded">Add</button>
         </form>
      </div>
    </div>
  );
}