import React from "react";
import { ThemeProvider } from "./components/ThemeContext";
import FeedScreen from "./screens/FeedScreen";

const App: React.FC = () => (
  <ThemeProvider>
    <FeedScreen />
  </ThemeProvider>
);

export default App;
