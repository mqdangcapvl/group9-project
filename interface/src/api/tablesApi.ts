const API_URL = 'http://localhost:5000';

export async function getTables() {

  const response = await fetch(
    `${API_URL}/cpp/tables`
  );

  return await response.json();
}

export async function startTable(
  id: number
) {

  const response = await fetch(
    `${API_URL}/cpp/tables/start/${id}`,
    {
      method: 'POST',
    }
  );

  return await response.json();
}

export async function endTable(
  id: number
) {

  const response = await fetch(
    `${API_URL}/cpp/tables/end/${id}`,
    {
      method: 'POST',
    }
  );

  return await response.json();
}