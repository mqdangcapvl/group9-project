const API_URL = 'http://localhost:5000';

async function parseResponse(response: Response) {
  const data = await response.json();
  if (!response.ok || data.success === false) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

export async function getEmployees() {
  return parseResponse(await fetch(`${API_URL}/cpp/employees`));
}

export async function getSalaries() {
  return parseResponse(await fetch(`${API_URL}/cpp/salaries`));
}

export async function saveSalary(data: any) {
  return parseResponse(await fetch(`${API_URL}/cpp/salaries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }));
}