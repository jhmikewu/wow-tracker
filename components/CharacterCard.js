"use client";
import { useState, useEffect } from 'react';
import { getCharacterData } from '../app/utils/raiderio';

export default function CharacterCard({ dbCharacter, onDelete }) {
  const [rioData, setRioData] = useState(null);
  const [wishlistText, setWishlistText] = useState('');
  const [wishlist, setWishlist] = useState(dbCharacter.wishlist || []);

  // 1. Fetch Raider.IO data when component mounts
  useEffect(() => {
    getCharacterData(dbCharacter.region, dbCharacter.realm, dbCharacter.name)
      .then(data => setRioData(data))
      .catch(err => console.error(err));
  }, [dbCharacter]);

  // 2. Handle adding a wishlist item
  const addWishlist = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/wishlist', {
      method: 'POST',
      body: JSON.stringify({ characterId: dbCharacter.id, description: wishlistText }),
    });
    const newItem = await res.json();
    setWishlist([...wishlist, newItem]);
    setWishlistText('');
  };

  if (!rioData) return <div className="p-4 border rounded">Loading {dbCharacter.name}...</div>;

  return (
    <div className="border rounded-lg shadow-lg p-6 bg-white text-black relative">
      <button onClick={() => onDelete(dbCharacter.id)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">X</button>
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <img src={rioData.thumbnail_url} alt="Avatar" className="w-12 h-12 rounded-full border" />
        <div>
          <h2 className="text-xl font-bold capitalize">{rioData.name}</h2>
          <p className="text-sm text-gray-600">{rioData.race} {rioData.class} - {rioData.active_spec_name}</p>
        </div>
        <div className="ml-auto text-right">
            <div className="text-2xl font-bold text-purple-600">{rioData.mythic_plus_scores_by_season[0].scores.all}</div>
            <div className="text-xs text-gray-500">IO Score</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gear Section with Wowhead Tooltips */}
        <div className="bg-gray-50 p-3 rounded">
          <h3 className="font-bold mb-2 text-sm uppercase text-gray-500">Equipped Gear ({rioData.gear.item_level_equipped})</h3>
          <div className="space-y-1 text-sm">
            {Object.values(rioData.gear.items).map((item) => (
              <div key={item.item_id} className="flex justify-between">
                 <a 
                    href={`https://www.wowhead.com/item=${item.item_id}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className={`hover:underline ${getQualityColor(item.item_quality)}`}
                 >
                   {item.name}
                 </a>
                 <span className="text-gray-500">{item.item_level}</span>
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

// Helper for colors
function getQualityColor(quality) {
    // Simple mapping, you can expand this
    if (quality === 4) return 'text-purple-600'; // Epic
    if (quality === 3) return 'text-blue-600';   // Rare
    return 'text-gray-800';
}