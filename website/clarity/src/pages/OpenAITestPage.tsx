import { motion } from "framer-motion";
import OpenAIDebug from "../components/OpenAIDebug";
import SimpleChat from "../components/SimpleChat";

function OpenAITestPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-blue-600 mb-2">
          OpenAI Integration Test
        </h1>
        <p className="text-gray-600">
          Use this page to test and debug OpenAI API integration issues
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <OpenAIDebug />
        <SimpleChat />
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Environment Variables Check</h2>
          <p className="mb-4">
            These checks help verify if your environment variables are correctly loaded:
          </p>
          
          <div className="space-y-2">
            <div className="p-3 bg-gray-100 rounded-md">
              <p className="font-medium">VITE_OPENAI_API_KEY:</p>
              <p>
                {import.meta.env.VITE_OPENAI_API_KEY 
                  ? `✅ Present (starts with: ${import.meta.env.VITE_OPENAI_API_KEY.substring(0, 5)}...)`
                  : "❌ Missing or empty"}
              </p>
            </div>
            
            <div className="p-3 bg-gray-100 rounded-md">
              <p className="font-medium">Environment:</p>
              <p>{import.meta.env.DEV ? "Development" : "Production"}</p>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <h3 className="font-medium text-yellow-800">Troubleshooting Tips:</h3>
            <ul className="mt-2 list-disc list-inside text-sm space-y-1 text-yellow-700">
              <li>Make sure your .env.local file is in the project root directory</li>
              <li>Confirm your API key starts with "sk-"</li>
              <li>Try restarting your development server after adding/changing env vars</li>
              <li>Check browser console for any CORS or network errors</li>
              <li>Verify your OpenAI account is in good standing with billing set up</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default OpenAITestPage;