const API_URL = 'http://localhost:5000';

export interface BillOrder {
  name: string;
  quantity: number;
  price: number;
  amount: number;
}

export interface BillPreview {
  success: boolean;
  tableNumber: string;
  tableCharge: number;
  foodTotal: number;
  discount: number;
  total: number;
  memberApplied: boolean;
  orders: BillOrder[];
}

export interface BillHistoryItem extends BillPreview {
  id: number;
  paidAt: string;
  memberName: string;
}

async function parseResponse(response: Response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || 'Request failed'
    );
  }

  return data;
}

export async function previewBill(tableNumber: string,memberName: string): Promise<BillPreview> {
  const response = await fetch(
    `${API_URL}/cpp/bill/preview`,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        tableNumber,
        memberName,
      }),
    }
  );

  return await parseResponse(response);
}

export async function saveBillHistory(
  bill: BillPreview,
  memberName: string
) {
  const response = await fetch(
    `${API_URL}/cpp/bill/history`,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        ...bill,
        memberName,
      }),
    }
  );

  return await parseResponse(response);
}

export async function getBillHistory(
  tableNumber: string
): Promise<BillHistoryItem[]> {
  const response = await fetch(
    `${API_URL}/cpp/bill/history?tableNumber=${encodeURIComponent(tableNumber)}`
  );

  const data = await parseResponse(response);

  return Array.isArray(data)
    ? data
    : [];
}

export async function clearTableOrders(
  tableNumber: string
) {
  const response = await fetch(
    `${API_URL}/cpp/orders/${encodeURIComponent(tableNumber)}`,
    {
      method: 'DELETE',
    }
  );

  return await parseResponse(response);
}
