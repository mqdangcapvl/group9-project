const API_URL = 'http://localhost:5000';

export async function getDashboardData() {
  const response = await fetch(
    `${API_URL}/cpp/dashboard`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || 'Cannot load dashboard'
    );
  }

  return data;
}
