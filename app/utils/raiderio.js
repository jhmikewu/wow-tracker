export async function getCharacterData(region, realm, name) {
    // CRITICAL FIX: Encode URI components to handle spaces (Grim Batol) and special chars (Lovelì)
    const safeName = encodeURIComponent(name);
    const safeRealm = encodeURIComponent(realm);

    const url = `https://raider.io/api/v1/characters/profile?region=${region}&realm=${safeRealm}&name=${safeName}&fields=gear,mythic_plus_scores_by_season:current,mythic_plus_best_runs`;

    try {
        const res = await fetch(url);
        if (!res.ok) {
            console.error(`Failed to fetch data for ${name}: ${res.status} ${res.statusText}`);
            return null;
        }
        return await res.json();
    } catch (error) {
        console.error("Error fetching Raider.IO data:", error);
        return null;
    }
}