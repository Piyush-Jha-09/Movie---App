import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import MovieDetails from "./pages/MovieDetails";
import Watchlist from "./pages/Watchlist";
import About from "./pages/About";
import ForYou from "./pages/ForYou";
import TasteProfile from "./pages/TasteProfile";
import IndianCinema from "./pages/IndianCinema";
import { MovieAssistantModal } from "./components/MovieAssistantModal";
import { MovieNightModal } from "./components/MovieNightModal";

function App() {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isMovieNightOpen, setIsMovieNightOpen] = useState(false);

  return (
    <BrowserRouter>
      <Navbar
        onOpenAssistant={() => setIsAssistantOpen(true)}
        onOpenMovieNight={() => setIsMovieNightOpen(true)}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/for-you" element={<ForYou />} />
        <Route path="/indian-cinema" element={<IndianCinema />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/profile" element={<TasteProfile />} />
        <Route path="/about" element={<About />} />
      </Routes>

      {/* Global Modals */}
      <MovieAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
      />
      <MovieNightModal
        isOpen={isMovieNightOpen}
        onClose={() => setIsMovieNightOpen(false)}
      />
    </BrowserRouter>
  );
}

export default App;

