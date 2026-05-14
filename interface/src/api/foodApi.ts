const API_URL = 'http://localhost:5000';

async function parseResponse(response: Response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || 'Request failed'
    );
  }

  return data;
}

export async function getFoods() {
  const response = await fetch(
    `${API_URL}/cpp/foods`
  );

  return await parseResponse(response);
}

export async function addFoodOrder(order: any) {
  const response = await fetch(
    `${API_URL}/cpp/orders`,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify(order),
    }
  );

  return await parseResponse(response);
}

export async function getOrders() {
  const response = await fetch(
    `${API_URL}/cpp/orders`
  );

  return await parseResponse(response);
}
export async function markOrderDone(tableNumber: string) {
  const response = await fetch(
    `${API_URL}/cpp/orders/${tableNumber}/done`,
    {
      method: 'PATCH',
    }
  );

  return await parseResponse(response);
}

export async function deleteOrder(tableNumber: string) {
  const response = await fetch(
    `${API_URL}/cpp/orders/${tableNumber}`,
    {
      method: 'DELETE',
    }
  );

  return await parseResponse(response);
}
