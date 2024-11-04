import React from "react";
import { ThemeProvider } from "./components/ThemeContext";
import FeedScreen from "./screens/FeedScreen";
const App = () => (
  <ThemeProvider>
    <FeedScreen />
  </ThemeProvider>
);

export default App;
