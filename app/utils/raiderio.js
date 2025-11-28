export async function getCharacterData(region, realm, name) {
  const safeRealm = encodeURIComponent(realm);
  const safeName = encodeURIComponent(name);
  // access_key=RIOBuCmQCQvA5awe9CRuZV6VT
  const url = `https://raider.io/api/v1/characters/profile?region=${region}&realm=${safeRealm}&name=${safeName}&fields=gear,mythic_plus_scores_by_season:current,mythic_plus_best_runs`;
  
  console.log("Fetching RaiderIO URL:", url); // <--- DEBUG LOG

  const response = await fetch(url);
  
  if (!response.ok) {
    console.log("RaiderIO Error Status:", response.status); // <--- DEBUG LOG
    return null; 
  }
  
  return response.json();
}