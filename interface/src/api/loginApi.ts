const API_URL = 'http://localhost:5000';

export async function login(
  username: string,
  password: string
) {
  const response = await fetch(
    `${API_URL}/cpp/login`,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        username,
        password,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
      data.message ||
      'Login failed'
    );
  }

  if (!data.success) {
    throw new Error(
      'Sai tài khoản hoặc mật khẩu'
    );
  }

  return data;
}
