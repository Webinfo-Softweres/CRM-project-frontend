import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";
import PWAInstallPrompt from "./components/common/PWAInstallPrompt";

function App() {
  return (
    <>
      <AppRoutes />
      <Toaster position="top-right" />
      <PWAInstallPrompt />
    </>
  );
}

export default App;