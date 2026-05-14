const API_URL = 'http://localhost:5000';

export async function getInventory() {

  const response = await fetch(
    `${API_URL}/cpp/inventory`
  );

  return await response.json();
}

export async function addInventoryItem(item: any) {

  const response = await fetch(
    `${API_URL}/cpp/inventory`,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify(item),
    }
  );

  return await response.json();
}