export const THEMES = {
    dark: {
        label: "Dark",
        bg: "bg-gray-900",
        text: "text-gray-200",
        textDim: "text-gray-400",
        panel: "bg-gray-800",
        border: "border-gray-700",
        header: "bg-black text-white",
        stickyHeader: "bg-black",
        stickyCol: "bg-gray-900",
        accentSlot: "text-cyan-500",
        accentDungeon: "text-orange-300",
        hover: "hover:bg-gray-750", 
        modalOverlay: "bg-black/70",
        inputBg: "bg-gray-900",
        inputBorder: "border-gray-600",
        isDark: true 
    },
    light: {
        label: "Light",
        bg: "bg-gray-100",
        text: "text-gray-900",
        textDim: "text-gray-500",
        panel: "bg-white",
        border: "border-gray-300",
        
        // --- CHANGE: Dark Header for Light Theme ---
        // This ensures white text (like Priest) is visible in the header
        header: "bg-gray-200 text-black", 
        stickyHeader: "bg-gray-300",
        // -----------------------------------------

        stickyCol: "bg-gray-50",
        accentSlot: "text-blue-700",
        accentDungeon: "text-orange-700",
        hover: "hover:bg-gray-100",
        modalOverlay: "bg-gray-500/50",
        inputBg: "bg-white",
        inputBorder: "border-gray-300",
        isDark: false
    }
};