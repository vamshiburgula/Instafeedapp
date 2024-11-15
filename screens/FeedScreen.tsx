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
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from "react-native";
import { Ionicons, AntDesign, Feather } from "@expo/vector-icons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

interface Post {
  id: string;
  imageUrl: string;
  likes: number;
  isLiked: boolean;
  comments: Comment[];
}

interface Comment {
  id: string;
  text: string;
  likes: number;
  isLiked: boolean;
  replies: Reply[];
}

interface Reply {
  id: string;
  text: string;
  likes: number;
  isLiked: boolean;
}

const fetchPostsFromApi = async (
  page: number,
  pageSize: number
): Promise<Post[]> => {
  const simulatedPosts = Array.from({ length: pageSize }, (_, i) => ({
    id: (page * pageSize + i + 1).toString(),
    imageUrl: `https://picsum.photos/300?random=${page * pageSize + i + 1}`,
    likes: Math.floor(Math.random() * 100),
    isLiked: false,
    comments: [],
  }));
  return simulatedPosts;
};

const FeedScreen: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEndReached, setIsEndReached] = useState<boolean>(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [newComment, setNewComment] = useState<string>("");

  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

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

  const openModal = (post: Post) => {
    setSelectedPost(post);
    setModalVisible(true);
  };

  const addComment = () => {
    if (newComment.trim() && selectedPost) {
      const comment: Comment = {
        id: Date.now().toString(),
        text: newComment.trim(),
        likes: 0,
        isLiked: false,
        replies: [],
      };
      const updatedPost = {
        ...selectedPost,
        comments: [...selectedPost.comments, comment],
      };
      updatePost(selectedPost.id, updatedPost);
      setNewComment("");
      setReplyTo(null);
      Keyboard.dismiss();
    }
  };

  const addReply = (commentId: string) => {
    if (newComment.trim() && selectedPost) {
      const reply: Reply = {
        id: Date.now().toString(),
        text: newComment.trim(),
        likes: 0,
        isLiked: false,
      };
      const updatedPost = {
        ...selectedPost,
        comments: selectedPost.comments.map((comment) =>
          comment.id === commentId
            ? { ...comment, replies: [...comment.replies, reply] }
            : comment
        ),
      };
      updatePost(selectedPost.id, updatedPost);
      setNewComment("");
      setReplyTo(null);
      Keyboard.dismiss();
    }
  };

  const deleteComment = (commentId: string) => {
    if (selectedPost) {
      const updatedPost = {
        ...selectedPost,
        comments: selectedPost.comments.filter(
          (comment) => comment.id !== commentId
        ),
      };
      updatePost(selectedPost.id, updatedPost);
    }
  };

  const deleteReply = (commentId: string, replyId: string) => {
    if (selectedPost) {
      const updatedPost = {
        ...selectedPost,
        comments: selectedPost.comments.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                replies: comment.replies.filter(
                  (reply) => reply.id !== replyId
                ),
              }
            : comment
        ),
      };
      updatePost(selectedPost.id, updatedPost);
    }
  };

  const updatePost = (postId: string, updatedPost: Post) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => (post.id === postId ? updatedPost : post))
    );
    setSelectedPost(updatedPost);
  };

  const togglePostLike = (postId: string) => {
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
        ...prevPost!,
        isLiked: !prevPost!.isLiked,
        likes: prevPost!.isLiked ? prevPost!.likes - 1 : prevPost!.likes + 1,
      }));
    }
  };

  const toggleCommentLike = (commentId: string) => {
    if (selectedPost) {
      const updatedPost = {
        ...selectedPost,
        comments: selectedPost.comments.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                isLiked: !comment.isLiked,
                likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
              }
            : comment
        ),
      };
      updatePost(selectedPost.id, updatedPost);
    }
  };

  const toggleReplyLike = (commentId: string, replyId: string) => {
    if (selectedPost) {
      const updatedPost = {
        ...selectedPost,
        comments: selectedPost.comments.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                replies: comment.replies.map((reply) =>
                  reply.id === replyId
                    ? {
                        ...reply,
                        isLiked: !reply.isLiked,
                        likes: reply.isLiked
                          ? reply.likes - 1
                          : reply.likes + 1,
                      }
                    : reply
                ),
              }
            : comment
        ),
      };
      updatePost(selectedPost.id, updatedPost);
    }
  };

  const handleKeyPress = (
    event: NativeSyntheticEvent<TextInputKeyPressEventData>
  ) => {
    if (event.nativeEvent.key === "Enter") {
      replyTo ? addReply(replyTo) : addComment();
    }
  };

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      {/* Theme Switcher */}
      <View style={styles.themeSwitcher}>
        <TouchableOpacity
          onPress={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          <Ionicons
            name={theme === "light" ? "moon" : "sunny"}
            size={24}
            color={theme === "light" ? "black" : "white"}
          />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
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
          isLoading ? <ActivityIndicator size="large" color="#888" /> : null
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
                  <View style={styles.actions}>
                    {/* Like, Comment, Share Icons */}
                    <TouchableOpacity
                      onPress={() => togglePostLike(selectedPost.id)}
                    >
                      <AntDesign
                        name={selectedPost.isLiked ? "heart" : "hearto"}
                        size={24}
                        color={selectedPost.isLiked ? "red" : "black"}
                      />
                      <Text style={styles.likesCount}>
                        {selectedPost.likes}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity>
                      <FontAwesome5 name="comment" size={24} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity>
                      <Feather name="send" size={24} color="black" />
                    </TouchableOpacity>
                  </View>

                  {/* Comments and Reply Section */}
                  <View style={styles.commentsContainer}>
                    {selectedPost.comments.map((comment) => (
                      <View key={comment.id} style={styles.comment}>
                        <Text style={styles.commentText}>{comment.text}</Text>
                        <View style={styles.commentActions}>
                          <TouchableOpacity
                            onPress={() => toggleCommentLike(comment.id)}
                          >
                            <AntDesign
                              name={comment.isLiked ? "heart" : "hearto"}
                              size={18}
                              color={comment.isLiked ? "red" : "black"}
                            />
                          </TouchableOpacity>
                          <Text style={styles.commentLikes}>
                            {comment.likes}
                          </Text>
                          <TouchableOpacity
                            onPress={() => deleteComment(comment.id)}
                          >
                            <Text style={styles.deleteText}>Delete</Text>
                          </TouchableOpacity>
                        </View>

                        {/* Replies nested under the comment */}
                        <View style={styles.repliesContainer}>
                          {comment.replies.map((reply) => (
                            <View key={reply.id} style={styles.reply}>
                              <Text style={styles.replyText}>{reply.text}</Text>
                              <View style={styles.commentActions}>
                                <TouchableOpacity
                                  onPress={() =>
                                    toggleReplyLike(comment.id, reply.id)
                                  }
                                >
                                  <AntDesign
                                    name={reply.isLiked ? "heart" : "hearto"}
                                    size={18}
                                    color={reply.isLiked ? "red" : "black"}
                                  />
                                </TouchableOpacity>
                                <Text style={styles.commentLikes}>
                                  {reply.likes}
                                </Text>
                                <TouchableOpacity
                                  onPress={() =>
                                    deleteReply(comment.id, reply.id)
                                  }
                                >
                                  <Text style={styles.deleteText}>Delete</Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          ))}
                        </View>
                        <TouchableOpacity
                          onPress={() => {
                            setReplyTo(comment.id);
                            setNewComment(`Replying to ${comment.text}`);
                          }}
                          style={styles.replyButton}
                        >
                          <Text>Reply</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                    <TextInput
                      style={styles.commentInput}
                      placeholder={
                        replyTo
                          ? `Replying to ${
                              selectedPost?.comments.find(
                                (c) => c.id === replyTo
                              )?.text
                            }`
                          : "Add a comment..."
                      }
                      placeholderTextColor="#888"
                      value={newComment}
                      onChangeText={setNewComment}
                      onKeyPress={handleKeyPress}
                    />
                    <TouchableOpacity
                      onPress={addComment}
                      style={styles.addButton}
                    >
                      <Text style={styles.addButtonText}>Add Comment</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const createStyles = (theme: "light" | "dark") =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme === "light" ? "#fff" : "#000",
    },
    themeSwitcher: {
      padding: 10,
      flexDirection: "row",
      justifyContent: "flex-end",
    },
    searchContainer: {
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme === "light" ? "#ccc" : "#555",
    },
    searchInput: {
      height: 40,
      borderRadius: 10,
      paddingLeft: 15,
      backgroundColor: theme === "light" ? "#f0f0f0" : "#333",
    },
    gridItem: {
      flex: 1,
      margin: 5,
      aspectRatio: 1,
    },
    image: {
      width: "100%",
      height: "100%",
      borderRadius: 0,
    },
    modalBackdrop: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContainer: {
      width: "80%",
      padding: 20,
      backgroundColor: "#fff",
      borderRadius: 10,
    },
    modalImage: {
      width: "100%",
      height: 200,
      marginBottom: 10,
    },
    actions: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginBottom: 10,
    },
    likesCount: {
      textAlign: "center",
      marginTop: 5,
    },
    commentsContainer: {
      marginTop: 10,
    },
    comment: {
      marginBottom: 15,
    },
    commentText: {
      fontSize: 14,
      marginBottom: 5,
    },
    commentActions: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    commentLikes: {
      marginLeft: 5,
    },
    deleteText: {
      color: "red",
      fontSize: 14,
    },
    replyButton: {
      marginTop: 10,
    },
    repliesContainer: {
      marginLeft: 20,
      marginTop: 10,
    },
    reply: {
      marginTop: 10,
    },
    replyText: {
      fontSize: 13,
      color: "#555",
    },
    commentInput: {
      height: 40,
      borderRadius: 20,
      borderColor: theme === "light" ? "#ccc" : "#777",
      borderWidth: 1,
      paddingLeft: 10,
      backgroundColor: theme === "light" ? "#f0f0f0" : "#333",
      color: theme === "light" ? "#000" : "#fff",
    },
    addButton: {
      marginTop: 10,
      padding: 10,
      backgroundColor: theme === "light" ? "#2196F3" : "#64B5F6",
      borderRadius: 5,
    },
    addButtonText: {
      color: "#fff",
      textAlign: "center",
    },
  });

export default FeedScreen;
