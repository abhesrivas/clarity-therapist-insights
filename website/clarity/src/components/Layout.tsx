import { Outlet, useParams } from "react-router-dom";
import { useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { useTheme } from "../utils/themeContext";
import { getTherapistById } from "../utils/therapistData";

function Layout() {
  const { id: therapistId } = useParams<{ id: string }>();
  const { setTheme, getColor } = useTheme();
  
  useEffect(() => {
    // Set theme based on therapist ID when component mounts
    if (therapistId) {
      const therapist = getTherapistById(therapistId);
      if (therapist) {
        setTheme(therapist.themeId);
      }
    }
  }, [therapistId, setTheme]);

  // Get background color from theme
  const bgColor = `bg-${getColor('background')}`;

  return (
    <div className={`min-h-screen flex flex-col ${bgColor}`}>
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default Layout;