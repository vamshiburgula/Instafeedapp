import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  Image,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  Modal,
  Keyboard,
  TouchableWithoutFeedback,
  SafeAreaView,
} from "react-native";
import { Ionicons, FontAwesome, AntDesign, Feather } from "@expo/vector-icons";

// Simulate API call
const fetchPostsFromApi = async (page, pageSize) => {
  const simulatedPosts = Array.from({ length: pageSize }, (_, i) => ({
    id: (page * pageSize + i + 1).toString(),
    imageUrl: `https://picsum.photos/300?random=${page * pageSize + i + 1}`,
    likes: Math.floor(Math.random() * 100),
    isLiked: false,
  }));
  return simulatedPosts;
};

const FeedScreen = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isEndReached, setIsEndReached] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [theme, setTheme] = useState("light");

  const pageSize = 9;

  useEffect(() => {
    loadMorePosts();
  }, []);

  const loadMorePosts = async () => {
    if (isLoading || isEndReached) return;

    setIsLoading(true);
    try {
      const newPosts = await fetchPostsFromApi(page, pageSize);
      if (newPosts.length === 0) {
        setIsEndReached(true);
      } else {
        setPosts((prevPosts) => [...prevPosts, ...newPosts]);
        setPage((prevPage) => prevPage + 1);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (post) => {
    setSelectedPost(post);
    setModalVisible(true);
  };

  const addComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now().toString(),
        text: newComment.trim(),
        likes: 0,
        isLiked: false,
        replies: [],
      };
      setComments((prevComments) => [...prevComments, comment]);
      setNewComment("");
      setReplyTo(null);
      Keyboard.dismiss();
    }
  };

  const addReply = (commentId) => {
    if (newComment.trim()) {
      const reply = {
        id: Date.now().toString(),
        text: newComment.trim(),
        likes: 0,
        isLiked: false,
      };
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === commentId
            ? { ...comment, replies: [...comment.replies, reply] }
            : comment
        )
      );
      setNewComment("");
      setReplyTo(null);
      Keyboard.dismiss();
    }
  };

  const deleteComment = (id) => {
    setComments((prevComments) =>
      prevComments.filter((comment) => comment.id !== id)
    );
  };

  const deleteReply = (commentId, replyId) => {
    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              replies: comment.replies.filter((reply) => reply.id !== replyId),
            }
          : comment
      )
    );
  };

  const togglePostLike = (postId) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );

    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost((prevPost) => ({
        ...prevPost,
        isLiked: !prevPost.isLiked,
        likes: prevPost.isLiked ? prevPost.likes - 1 : prevPost.likes + 1,
      }));
    }
  };

  const toggleCommentLike = (id) => {
    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment.id === id
          ? {
              ...comment,
              isLiked: !comment.isLiked,
              likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
            }
          : comment
      )
    );
  };

  const toggleReplyLike = (commentId, replyId) => {
    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              replies: comment.replies.map((reply) =>
                reply.id === replyId
                  ? {
                      ...reply,
                      isLiked: !reply.isLiked,
                      likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1,
                    }
                  : reply
              ),
            }
          : comment
      )
    );
  };

  const handleKeyPress = (event) => {
    if (event.nativeEvent.key === "Enter") {
      replyTo ? addReply(replyTo) : addComment();
    }
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor="#888"
        />
      </View>
      <FlatList
        data={posts}
        numColumns={3}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.gridItem}
            onPress={() => openModal(item)}
          >
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
          </TouchableOpacity>
        )}
        onEndReached={loadMorePosts}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoading && <ActivityIndicator size="large" color="#888" />
        }
      />
      {selectedPost && (
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.modalBackdrop}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContainer}>
                  <Image
                    source={{ uri: selectedPost.imageUrl }}
                    style={styles.modalImage}
                  />
                  <Text style={styles.modalLikes}>
                    {selectedPost.likes} Likes
                  </Text>
                  <View style={styles.iconContainer}>
                    <TouchableOpacity
                      onPress={() => togglePostLike(selectedPost.id)}
                      style={styles.iconSpacing}
                    >
                      <AntDesign
                        name={selectedPost.isLiked ? "heart" : "hearto"}
                        size={30}
                        color={selectedPost.isLiked ? "red" : "black"}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setReplyTo(null)}
                      style={styles.iconSpacing}
                    >
                      <Ionicons
                        name="chatbubble-outline"
                        size={30}
                        color="black"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconSpacing}>
                      <Feather name="send" size={30} color="black" />
                    </TouchableOpacity>
                  </View>

                  <FlatList
                    data={comments}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <View style={styles.comment}>
                        <Text style={styles.commentText}>{item.text}</Text>
                        <View style={styles.commentActions}>
                          <TouchableOpacity
                            onPress={() => toggleCommentLike(item.id)}
                          >
                            <FontAwesome
                              name={item.isLiked ? "heart" : "heart-o"}
                              size={20}
                              color={item.isLiked ? "red" : "black"}
                            />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => setReplyTo(item.id)}>
                            <Text style={styles.replyText}>Reply</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => deleteComment(item.id)}
                          >
                            <Text style={styles.deleteText}>Delete</Text>
                          </TouchableOpacity>
                        </View>
                        {item.replies.map((reply) => (
                          <View key={reply.id} style={styles.reply}>
                            <Text style={styles.replyText}>{reply.text}</Text>
                            <View style={styles.replyActions}>
                              <TouchableOpacity
                                onPress={() =>
                                  toggleReplyLike(item.id, reply.id)
                                }
                              >
                                <FontAwesome
                                  name={reply.isLiked ? "heart" : "heart-o"}
                                  size={20}
                                  color={reply.isLiked ? "red" : "black"}
                                />
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() => deleteReply(item.id, reply.id)}
                              >
                                <Text style={styles.deleteText}>Delete</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                    style={styles.commentList}
                  />

                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="Add a comment..."
                      value={newComment}
                      onChangeText={setNewComment}
                      onKeyPress={handleKeyPress}
                    />
                    <TouchableOpacity
                      onPress={replyTo ? () => addReply(replyTo) : addComment}
                    >
                      <Text style={styles.postText}>
                        {replyTo ? "Reply" : "Post"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
      <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
        <Text style={styles.themeToggleText}>
          Switch to {theme === "light" ? "Dark" : "Light"} Theme
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme === "light" ? "#fff" : "#121212",
      paddingTop: 40,
    },
    searchContainer: {
      padding: 10,
      backgroundColor: theme === "light" ? "#f0f0f0" : "#2c2c2c",
    },
    searchInput: {
      height: 40,
      borderColor: "#ccc",
      borderWidth: 1,
      borderRadius: 5,
      paddingHorizontal: 15,
      color: theme === "light" ? "#000" : "#fff",
    },
    gridItem: {
      flex: 1,
      margin: 2,
      aspectRatio: 1,
    },
    image: {
      flex: 1,
      borderRadius: 0,
      margin: 1,
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.7)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContainer: {
      width: "90%",
      backgroundColor: theme === "light" ? "#fff" : "#1e1e1e",
      borderRadius: 20,
      padding: 20,
    },
    modalImage: {
      width: "100%",
      height: 300,
      borderRadius: 20,
      marginBottom: 10,
    },
    modalLikes: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 10,
      color: theme === "light" ? "#000" : "#fff",
    },
    iconContainer: {
      flexDirection: "row",
      marginBottom: 10,
    },
    iconSpacing: {
      marginRight: 15,
    },
    comment: {
      marginBottom: 10,
      borderBottomColor: theme === "light" ? "#ccc" : "#555",
      borderBottomWidth: 1,
      paddingBottom: 5,
    },
    commentText: {
      color: theme === "light" ? "#000" : "#fff",
    },
    commentActions: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 5,
    },
    replyText: {
      color: "#007BFF",
      marginLeft: 10,
    },
    deleteText: {
      color: "red",
      marginLeft: 10,
    },
    reply: {
      marginLeft: 20,
      marginTop: 5,
    },
    replyActions: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    commentList: {
      maxHeight: 200,
      marginBottom: 10,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderTopColor: theme === "light" ? "#ccc" : "#555",
      borderTopWidth: 1,
      paddingTop: 10,
    },
    input: {
      flex: 1,
      padding: 10,
      borderRadius: 20,
      backgroundColor: theme === "light" ? "#f0f0f0" : "#2c2c2c",
      color: theme === "light" ? "#000" : "#fff",
    },
    postText: {
      color: "#007BFF",
      marginLeft: 10,
    },
    themeToggle: {
      alignItems: "center",
      padding: 10,
    },
    themeToggleText: {
      color: "#007BFF",
      fontSize: 16,
    },
  });

export default FeedScreen;
