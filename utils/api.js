import axios from "axios";

const API_BASE_URL = "https://jsonplaceholder.typicode.com";

// Fetch posts with pagination
export const loadPosts = async (page = 1) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/posts?_page=${page}&_limit=10`
    );
    return response.data; // Returns an array of posts
  } catch (error) {
    console.error("Error loading posts:", error);
    throw error;
  }
};

export const displayPosts = async () => {
  const posts = await loadPosts(1); // Fetch first page
  console.log(posts); // Display posts in the console
};
