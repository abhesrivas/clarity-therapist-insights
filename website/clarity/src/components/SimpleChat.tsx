import { useState } from "react";

function SimpleChat() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const keyToUse = apiKey || import.meta.env.VITE_OPENAI_API_KEY;
      console.log("API key (first few chars):", keyToUse ? keyToUse.substring(0, 5) + "..." : "MISSING");
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${keyToUse}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant."
            },
            {
              role: "user",
              content: message
            }
          ],
          temperature: 0.7,
          max_tokens: 300
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
      console.log("Success response:", data);
      setResponse(data.choices[0].message.content);
    } catch (err) {
      console.error("Exception occurred:", err);
      setError(`Exception: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Simple OpenAI Chat</h2>
      
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
      </div>
      
      <form onSubmit={handleSendMessage} className="mb-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows={3}
            placeholder="Type your message here..."
          ></textarea>
        </div>
        
        <button
          type="submit"
          disabled={loading || !message.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </form>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded text-red-800">
          <p className="font-medium">Error:</p>
          <pre className="mt-1 text-sm overflow-auto">{error}</pre>
        </div>
      )}
      
      {response && (
        <div className="mt-4">
          <h3 className="font-medium text-gray-800">Response:</h3>
          <div className="mt-2 p-3 bg-gray-100 border border-gray-200 rounded">
            {response}
          </div>
        </div>
      )}
    </div>
  );
}

export default SimpleChat;