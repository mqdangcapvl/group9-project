const API_URL = 'http://localhost:5000';

export async function
getMembers() {
  const response = await fetch(
    `${API_URL}/cpp/members`
  );
  return await response.json();
}

export async function
addMember(member: any) {
  const response = await fetch(
    `${API_URL}/cpp/members`,
    {
      method: 'POST',
      headers: {
        'Content-Type':
          'application/json',
      },
      body: JSON.stringify(member),
    }
  );

  return await response.json();
}

export async function
deleteMember(id: number) {
  const response = await fetch(
    `${API_URL}/cpp/members/${id}`,
    {
      method: 'DELETE',
    }
  );

  return await response.json();
}