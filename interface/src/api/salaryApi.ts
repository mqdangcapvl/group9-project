const API_URL = 'http://localhost:5000';

export async function getEmployees() {

  const response = await fetch(
    `${API_URL}/cpp/employees`
  );

  return await response.json();
}

export async function getSalaries() {

  const response = await fetch(
    `${API_URL}/cpp/salaries`
  );

  return await response.json();
}

export async function saveSalary(data: any) {

  const response = await fetch(
    `${API_URL}/cpp/salaries`,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify(data),
    }
  );

  return await response.json();
}