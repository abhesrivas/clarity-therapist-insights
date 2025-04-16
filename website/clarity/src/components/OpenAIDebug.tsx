import { useState } from 'react';

function OpenAIDebug() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>('');

  const testOpenAI = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Log key info (securely)
      const keyToUse = apiKey || import.meta.env.VITE_OPENAI_API_KEY;
      console.log("Using API key:", keyToUse ? `${keyToUse.substring(0, 5)}...` : "No key available");
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${keyToUse}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", // Using a widely available model
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant."
            },
            {
              role: "user", 
              content: "Say hello world"
            }
          ],
          temperature: 0.7,
          max_tokens: 50
        })
      });
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        setError(`Error: ${errorData.error?.message || response.statusText}`);
        return;
      }
      
      const data = await response.json();
      console.log("Success! Response:", data);
      setResult(data.choices[0].message.content);
    } catch (err) {
      console.error("Exception occurred:", err);
      setError(`Exception: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">OpenAI API Debug Tool</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          API Key Override (optional)
        </label>
        <input
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
        <p className="text-xs text-gray-500 mt-1">
          Leave empty to use the environment variable
        </p>
      </div>
      
      <button
        onClick={testOpenAI}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test OpenAI Connection'}
      </button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded text-red-800">
          <p className="font-medium">Error:</p>
          <pre className="mt-1 text-sm overflow-auto">{error}</pre>
        </div>
      )}
      
      {result && (
        <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded">
          <p className="font-medium text-green-800">Success!</p>
          <p className="mt-1">{result}</p>
        </div>
      )}
      
      <div className="mt-4 p-3 bg-gray-100 border border-gray-200 rounded">
        <p className="font-medium text-gray-800">Environment Check:</p>
        <ul className="mt-1 text-sm">
          <li>API Key in env: {import.meta.env.VITE_OPENAI_API_KEY ? '✅ Present' : '❌ Missing'}</li>
          <li>Running in: {import.meta.env.DEV ? 'Development' : 'Production'}</li>
        </ul>
      </div>
    </div>
  );
}

export default OpenAIDebug;