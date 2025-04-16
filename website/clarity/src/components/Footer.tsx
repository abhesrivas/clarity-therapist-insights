import { useTheme } from "../utils/themeContext";

function Footer() {
  const { getColor } = useTheme();
  
  // Get colors from theme
  const primaryColor = `text-${getColor('primary')}`;

  return (
    <footer className="bg-white border-t border-gray-200 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <span className={`text-xl font-bold ${primaryColor}`}>Clarity</span>
            <span className="ml-2 text-sm text-gray-500">for Therapists</span>
          </div>
          
          <div className="flex space-x-6">
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
              Contact Support
            </a>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-100 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Clarity. All rights reserved.</p>
          <p className="mt-1">
            Clarity is a platform designed to help therapists provide better care through data-driven insights.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;