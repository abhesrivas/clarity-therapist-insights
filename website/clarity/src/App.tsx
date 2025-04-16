import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./utils/themeContext";
import Layout from "./components/Layout";
import TherapistSelection from "./pages/TherapistSelection";
import Dashboard from "./pages/Dashboard";
import PatientHistory from "./pages/PatientHistory";
import Chat from "./pages/Chat";
import PatientRehearsal from "./pages/PatientRehearsal";
import PlanNextCall from "./pages/PlanNextCall";
import ScreenConditions from "./pages/ScreenConditions";
import ReferToExpert from "./pages/ReferToExpert";
import NotFound from "./pages/NotFound";
import OpenAITestPage from "./pages/OpenAITestPage"; // Import the test page
import SimpleTest from "./pages/SimpleTest";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing page - Therapist Selection */}
          <Route path="/" element={<TherapistSelection />} />
          
          {/* Test Page for OpenAI Integration */}
          <Route path="/openai-test" element={<OpenAITestPage />} />
          
          <Route path="/simple-test" element={<SimpleTest />} />

          {/* Protected routes - after therapist selection */}
          <Route path="/therapist/:id" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="patient-history/:patientId" element={<PatientHistory />} />
            <Route path="chat/:patientId" element={<Chat />} />
            <Route path="rehearse/:patientId" element={<PatientRehearsal />} />
            <Route path="plan/:patientId" element={<PlanNextCall />} />
            <Route path="screen/:patientId" element={<ScreenConditions />} />
            <Route path="refer/:patientId" element={<ReferToExpert />} />
          </Route>

          {/* IMPORTANT: DO NOT place any routes below this. */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;