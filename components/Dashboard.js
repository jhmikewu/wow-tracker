"use client";
import { useState, useEffect, useCallback } from 'react';
import { getCharacterData } from '../app/utils/raiderio';

const getIconUrl = (iconName) => `/api/icon/${iconName}`; 

const GEAR_SLOTS = [
    { key: 'head', label: 'Head' },
    { key: 'neck', label: 'Neck' },
    { key: 'shoulder', label: 'Shoulder' },
    { key: 'back', label: 'Back' },
    { key: 'chest', label: 'Chest' },
    { key: 'wrist', label: 'Wrist' },
    { key: 'hands', label: 'Hands' },
    { key: 'waist', label: 'Waist' },
    { key: 'legs', label: 'Legs' },
    { key: 'feet', label: 'Feet' },
    { key: 'finger1', label: 'Ring 1' },
    { key: 'finger2', label: 'Ring 2' },
    { key: 'trinket1', label: 'Trinket 1' },
    { key: 'trinket2', label: 'Trinket 2' },
    { key: 'mainhand', label: 'Main Hand' },
    { key: 'offhand', label: 'Off Hand' },
];

const DUNGEONS = [
    { name: "Tazavesh: So'leah's Gambit", abbr: "GMBT", icon: "achievement_dungeon_brokerdungeon" },
    { name: "Eco-Dome Al'dani",         abbr: "ECO",  icon: "inv_112_achievement_dungeon_ecodome" }, 
    { name: "Halls of Atonement",       abbr: "HOA",  icon: "achievement_dungeon_hallsofattonement" },
    { name: "The Dawnbreaker",          abbr: "DAWN", icon: "inv_achievement_dungeon_dawnbreaker" }, 
    { name: "Ara-Kara, City of Echoes", abbr: "ARAK",  icon: "inv_achievement_dungeon_arak-ara" }, 
    { name: "Operation: Floodgate",     abbr: "FLOOD",  icon: "inv_achievement_dungeon_waterworks" }, 
    { name: "Priory of the Sacred Flame",abbr: "PRIORY",  icon: "inv_achievement_dungeon_prioryofthesacredflame" }, 
    { name: "Tazavesh: Streets of Wonder",abbr: "STRT", icon: "achievement_dungeon_brokerdungeon" }
];

export default function Dashboard({ characters, onDelete, theme }) {
    const [dataMap, setDataMap] = useState({}); 
    const [orderedChars, setOrderedChars] = useState([]);
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchAllData = useCallback(async () => {
        if (characters.length === 0) return;
        
        setIsRefreshing(true);
        
        const promises = characters.map(char => 
            getCharacterData(char.region, char.realm, char.name)
                .then(data => {
                    if (data) {
                        setDataMap(prev => ({ ...prev, [char.id]: data }));
                    }
                })
        );

        await Promise.all(promises);
        setIsRefreshing(false);
        
        if (window.$WowheadPower) {
            setTimeout(() => window.$WowheadPower.refreshLinks(), 500);
        }
    }, [characters]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    useEffect(() => {
        const savedIds = JSON.parse(localStorage.getItem('wow-tracker-order') || '[]');
        
        const sorted = [...characters].sort((a, b) => {
            const indexA = savedIds.indexOf(a.id);
            const indexB = savedIds.indexOf(b.id);
            
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return 0;
        });
        
        setOrderedChars(sorted);
    }, [characters]);

    const handleDragStart = (e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = "move";
        e.target.style.opacity = '0.5';
    };

    const handleDragEnd = (e) => {
        setDraggedIndex(null);
        e.target.style.opacity = '1';
        const ids = orderedChars.map(c => c.id);
        localStorage.setItem('wow-tracker-order', JSON.stringify(ids));
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newOrder = [...orderedChars];
        const draggedItem = newOrder[draggedIndex];
        newOrder.splice(draggedIndex, 1);
        newOrder.splice(index, 0, draggedItem);
        
        setOrderedChars(newOrder);
        setDraggedIndex(index);
    };

    return (
        <div className={`${theme.bg} ${theme.text} p-4 min-h-screen font-sans text-xs transition-colors duration-300`}>
            
            <div className={`overflow-x-auto border ${theme.border} rounded-lg ${theme.panel} inline-block min-w-full shadow-xl`}>
                <table className="border-collapse table-fixed">
                    <thead>
                        <tr className={`${theme.header} border-b ${theme.border}`}>
                            <th className={`p-2 text-left w-28 min-w-[106px] sticky left-0 z-20 border-r ${theme.border} ${theme.stickyHeader}`}>
                                <div className="flex items-center justify-between h-full">
                                    <span className="truncate" title="Characters">Characters</span>
                                    <button 
                                        onClick={fetchAllData}
                                        disabled={isRefreshing}
                                        className={`p-1 rounded hover:bg-gray-500/20 transition-all ${isRefreshing ? 'opacity-50 cursor-not-allowed' : 'hover:text-blue-400'}`}
                                        title="Refresh All Data"
                                    >
                                        <svg 
                                            className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`} 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    </button>
                                </div>
                            </th>
                            
                            {orderedChars.map((char, index) => {
                                const rio = dataMap[char.id];
                                return (
                                    <th 
                                        key={char.id} 
                                        className={`p-1 w-22 min-w-[88px] border-l ${theme.border} text-center relative group ${theme.stickyHeader} cursor-move transition-colors duration-200 ${draggedIndex === index ? 'bg-blue-900/30' : ''}`}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, index)}
                                        onDragEnd={handleDragEnd}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                    >
                                        <div className={`font-bold truncate text-[11px] ${rio ? getClassColor(rio.class) : theme.textDim}`}>
                                            {rio ? (
                                                <a 
                                                    href={rio.profile_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="hover:underline"
                                                >
                                                    {rio.name}
                                                </a>
                                            ) : char.name}
                                        </div>
                                        {rio && (
                                            <div className={`text-[10px] ${theme.textDim} font-normal leading-tight mt-0.5`}>
                                                {rio.gear.item_level_equipped} <br/>
                                                <span className="text-purple-500 font-bold">{rio.mythic_plus_scores_by_season[0].scores.all}</span>
                                                <div className="text-[9px] text-gray-500 mt-0.5 opacity-75" title={`Last updated: ${new Date(rio.last_crawled_at).toLocaleString()}`}>
                                                    {timeAgo(rio.last_crawled_at)}
                                                </div>
                                            </div>
                                        )}
                                        <button 
                                            onClick={() => onDelete(char.id)}
                                            className="absolute top-0 right-0 text-red-500 opacity-0 group-hover:opacity-100 hover:text-red-700 text-[10px] font-bold px-1"
                                        >
                                            x
                                        </button>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {/* --- GEAR SECTION --- */}
                        <tr className={`${theme.stickyCol} ${theme.textDim} font-bold uppercase text-[10px]`}>
                            <td className={`p-1 pl-2 sticky left-0 z-10 border-r ${theme.border} ${theme.stickyCol}`} colSpan={orderedChars.length + 1}>
                                Equipment
                            </td>
                        </tr>

                        {GEAR_SLOTS.map(slot => (
                            <tr key={slot.key} className={`border-t ${theme.border} hover:bg-black/10 h-9`}>
                                <td className={`p-1 pl-2 font-bold ${theme.accentSlot} ${theme.stickyCol} sticky left-0 border-r ${theme.border} z-10 truncate text-[11px]`}>
                                    {slot.label}
                                </td>
                                {orderedChars.map(char => {
                                    const rio = dataMap[char.id];
                                    const item = rio?.gear?.items?.[slot.key];

                                    if (!item) return <td key={char.id} className={`border-l ${theme.border} ${theme.panel}`}></td>;

                                    return (
                                        <td key={char.id} className={`border-l ${theme.border} text-center ${theme.panel} align-middle p-0`}>
                                            <div className="flex justify-center items-center h-full">
                                                <a href={`https://www.wowhead.com/cn/item=${item.item_id}`} 
                                                   data-wh-rename-link="false" 
                                                   data-wh-icon-size="none" 
                                                   target="_blank"
                                                   className="relative block w-7 h-7 overflow-hidden"
                                                >
                                                    <img 
                                                        src={getIconUrl(item.icon)} 
                                                        className={`absolute inset-0 w-full h-full border rounded ${getQualityBorder(item.item_quality)} z-10`} 
                                                        alt={slot.label}
                                                    />
                                                    <span className="absolute bottom-0 right-0 bg-black/90 text-white text-[9px] px-0.5 leading-none rounded-tl z-20 scale-90 origin-bottom-right">
                                                        {item.item_level}
                                                    </span>
                                                </a>
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}

                        {/* --- DUNGEONS SECTION --- */}
                        <tr className={`${theme.stickyCol} ${theme.textDim} font-bold uppercase text-[10px] border-t-4 ${theme.border}`}>
                            <td className={`p-1 pl-2 sticky left-0 z-10 border-r ${theme.border} ${theme.stickyCol}`} colSpan={orderedChars.length + 1}>
                                Dungeons (S3)
                            </td>
                        </tr>

                        {DUNGEONS.map(dungeon => (
                            <tr key={dungeon.name} className={`border-t ${theme.border} hover:bg-black/10 h-9`}>
                                <td className={`p-1 pl-2 font-bold ${theme.accentDungeon} ${theme.stickyCol} sticky left-0 border-r ${theme.border} z-10`} title={dungeon.name}>
                                    <div className="flex items-center gap-1.5">
                                        <img 
                                            src={getIconUrl(dungeon.icon)} 
                                            className={`w-5 h-5 rounded border ${theme.border}`} 
                                            alt={dungeon.abbr}
                                        />
                                        <span className="truncate text-[11px]">{dungeon.abbr}</span>
                                    </div>
                                </td>
                                {orderedChars.map(char => {
                                    const rio = dataMap[char.id];
                                    const run = rio?.mythic_plus_best_runs?.find(r => r.dungeon === dungeon.name);

                                    if (!run) return (
                                        <td key={char.id} className={`border-l ${theme.border} text-center ${theme.textDim} ${theme.panel}`}>
                                            -
                                        </td>
                                    );

                                    return (
                                        <td key={char.id} className={`border-l ${theme.border} text-center ${theme.panel} p-0`}>
                                            <div className="flex flex-col justify-center h-full">
                                                <a 
                                                    href={run.url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="flex flex-col justify-center w-full h-full"
                                                >
                                                    {/* MODIFICATION POINT: Change text-sm below to adjust size */}
                                                    <span className={`text-sm font-bold ${theme.text} leading-none hover:underline`}>
                                                        {run.mythic_level}{run.num_keystone_upgrades > 0 && <span className="text-green-500 text-[9px] ml-0.5">+{run.num_keystone_upgrades}</span>}
                                                    </span>
                                                </a>
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function getClassColor(className) {
    const colors = {
        'Death Knight': 'text-[#C41F3B]',
        'Demon Hunter': 'text-[#A330C9]',
        'Druid': 'text-[#FF7D0A]',
        'Evoker': 'text-[#33937F]',
        'Hunter': 'text-[#ABD473]',
        'Mage': 'text-[#40C7EB]',
        'Monk': 'text-[#00FF96]',
        'Paladin': 'text-[#F58CBA]',
        'Priest': 'text-[#FFFFFF] shadow-black drop-shadow-sm', 
        'Rogue': 'text-[#FFF569] drop-shadow-sm',
        'Shaman': 'text-[#0070DE]',
        'Warlock': 'text-[#8787ED]',
        'Warrior': 'text-[#C79C6E]',
    };
    return colors[className] || 'text-gray-500';
}

function getQualityBorder(quality) {
    if (quality === 5) return 'border-[#ff8000]'; 
    if (quality === 4) return 'border-[#a335ee]'; 
    if (quality === 3) return 'border-[#0070dd]'; 
    return 'border-[#9d9d9d]'; 
}

function timeAgo(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'just now';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    
    return `${Math.floor(days / 365)}y ago`;
}