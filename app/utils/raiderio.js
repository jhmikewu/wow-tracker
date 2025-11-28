export async function getCharacterData(region, realm, name) {
  // We default to US if not provided, but the UI will provide it
  const url = `https://raider.io/api/v1/characters/profile?access_key=RIOBuCmQCQvA5awe9CRuZV6VT&region=${region}&realm=${realm}&name=${name}&fields=gear,mythic_plus_scores_by_season:current&fields=gear,mythic_plus_scores_by_season:current,mythic_plus_best_runs`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    return null; // Character not found or API error
  }
  
  return response.json();
}