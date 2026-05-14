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

export async function getEmployees() {
  const response = await fetch(
    `${API_URL}/cpp/employees`
  );

  return await parseResponse(response);
}

export async function addEmployee(employee: any) {
  const response = await fetch(
    `${API_URL}/cpp/employees`,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify(employee),
    }
  );

  return await parseResponse(response);
}

export async function deleteEmployee(id: number) {
  const response = await fetch(
    `${API_URL}/cpp/employees/${id}`,
    {
      method: 'DELETE',
    }
  );

  return await parseResponse(response);
}

export async function getEmployeeAssignments() {
  const response = await fetch(
    `${API_URL}/cpp/employee-assignments`
  );

  return await parseResponse(response);
}

export async function saveEmployeeAssignment(data: {
  employeeId: number;
  tableIds: number[];
}) {
  const response = await fetch(
    `${API_URL}/cpp/employee-assignments`,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify(data),
    }
  );

  return await parseResponse(response);
}

export async function clearEmployeeAssignment(employeeId: number) {
  const response = await fetch(
    `${API_URL}/cpp/employee-assignments/${employeeId}`,
    {
      method: 'DELETE',
    }
  );

  return await parseResponse(response);
}
