export const runCppCommand = async (
  commands: string[]
) => {

  const response = await fetch(
    'http://localhost:5000/cpp-command',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        commands,
      }),
    }
  );

  return await response.json();
};