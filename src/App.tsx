import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { Toaster } from "react-hot-toast";
import { config } from "./lib/celoConfig";
import { Home } from "./pages/Home";
import { Game } from "./pages/Game";
import { DailyChallenge } from "./pages/DailyChallenge";
import { Leaderboard } from "./pages/Leaderboard";
import { Profile } from "./pages/Profile";
import { CreateLevel } from "./pages/CreateLevel";
import { Navbar } from "./components/Navbar";

import "@rainbow-me/rainbowkit/styles.css";
import "./index.css";

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/play" element={<Game />} />
                <Route path="/play/:levelId" element={<Game />} />
                <Route path="/daily" element={<DailyChallenge />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/create" element={<CreateLevel />} />
              </Routes>
              <Toaster
                position="bottom-center"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: "#363636",
                    color: "#fff",
                  },
                  success: {
                    iconTheme: {
                      primary: "#35D07F",
                      secondary: "#fff",
                    },
                  },
                }}
              />
            </div>
          </Router>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
