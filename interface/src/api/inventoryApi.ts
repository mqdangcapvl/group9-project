const API_URL = 'http://localhost:5000';

async function parseResponse(response: Response) {
  const data = await response.json();
  if (!response.ok || data.success === false) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

export async function getInventory() {
  return parseResponse(await fetch(`${API_URL}/cpp/inventory`));
}

export async function addInventoryItem(item: any) {
  return parseResponse(await fetch(`${API_URL}/cpp/inventory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  }));
}