const API_URL = 'http://localhost:5000';

async function parseResponse(response: Response) {
  const data = await response.json();
  if (!response.ok || data.success === false) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

export async function getFoods() {
  return parseResponse(await fetch(`${API_URL}/cpp/foods`));
}

export async function getOrders() {
  return parseResponse(await fetch(`${API_URL}/cpp/orders`));
}

export async function addFoodOrder(order: any) {
  return parseResponse(await fetch(`${API_URL}/cpp/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  }));
}

export async function markOrderDone(tableNumber: string) {
  return parseResponse(await fetch(`${API_URL}/cpp/orders/${tableNumber}/done`, {
    method: 'PATCH',
  }));
}

export async function deleteOrder(tableNumber: string) {
  return parseResponse(await fetch(`${API_URL}/cpp/orders/${tableNumber}`, {
    method: 'DELETE',
  }));
}