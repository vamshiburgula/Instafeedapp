import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  Text,
  ActivityIndicator,
  Image,
  TextInput,
  Button,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import axios from "axios";
import Icon from "react-native-vector-icons/FontAwesome";

const { width } = Dimensions.get("window"); // Get screen width

const API_BASE_URL = "https://jsonplaceholder.typicode.com";

const getRandomLikes = () => Math.floor(Math.random() * 1000); // Random likes between 0-999

const FeedScreen = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [showComments, setShowComments] = useState({});
  const [showReplies, setShowReplies] = useState({});

  const loadPosts = async (pageNumber) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/posts?_page=${pageNumber}&_limit=10`
      );
      const postsWithImages = response.data.map((post) => ({
        ...post,
        imageUrl: `https://picsum.photos/200/150?random=${post.id}`,
        likes: getRandomLikes(),
        liked: false,
        comments: [], // Initialize comments as an empty array
      }));

      setPosts((prevPosts) =>
        pageNumber === 1 ? postsWithImages : [...prevPosts, ...postsWithImages]
      );
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadPosts(page);
  }, [page]);

  const toggleLike = (post) => {
    const updatedPosts = posts.map((p) => {
      if (p.id === post.id) {
        const newLikes = post.liked ? post.likes - 1 : post.likes + 1;
        return { ...p, liked: !p.liked, likes: newLikes };
      }
      return p;
    });
    setPosts(updatedPosts);
  };

  const addComment = (postId) => {
    if (!commentText.trim()) return;
    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        const newComment = { id: Date.now(), text: commentText, replies: [] };
        return { ...post, comments: [...post.comments, newComment] };
      }
      return post;
    });
    setPosts(updatedPosts);
    setCommentText("");
  };

  const deleteComment = (postId, commentId) => {
    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        return {
          ...post,
          comments: post.comments.filter((comment) => comment.id !== commentId),
        };
      }
      return post;
    });
    setPosts(updatedPosts);
  };

  const toggleCommentSection = (postId) => {
    setShowComments((prevState) => ({
      ...prevState,
      [postId]: !prevState[postId],
    }));
  };

  const addReply = (postId, commentId) => {
    if (!replyText.trim()) return;
    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        const updatedComments = post.comments.map((comment) => {
          if (comment.id === commentId) {
            const newReply = { id: Date.now(), text: replyText };
            return { ...comment, replies: [...comment.replies, newReply] };
          }
          return comment;
        });
        return { ...post, comments: updatedComments };
      }
      return post;
    });
    setPosts(updatedPosts);
    setReplyText("");
    setShowReplies((prevState) => ({ ...prevState, [commentId]: false }));
  };

  const toggleReplySection = (commentId) => {
    setShowReplies((prevState) => ({
      ...prevState,
      [commentId]: !prevState[commentId],
    }));
  };

  const deleteReply = (postId, commentId, replyId) => {
    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        const updatedComments = post.comments.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              replies: comment.replies.filter((reply) => reply.id !== replyId),
            };
          }
          return comment;
        });
        return { ...post, comments: updatedComments };
      }
      return post;
    });
    setPosts(updatedPosts);
  };

  const renderReply = (reply, postId, commentId) => (
    <View key={reply.id} style={styles.reply}>
      <View style={styles.replyContent}>
        <Icon
          name="user-circle"
          size={20}
          color="#ccc"
          style={styles.replyIcon}
        />
        <Text style={styles.replyText}>{reply.text}</Text>
      </View>
      <TouchableOpacity
        onPress={() => deleteReply(postId, commentId, reply.id)}
      >
        <Icon name="trash" size={16} color="red" />
      </TouchableOpacity>
    </View>
  );

  const renderComment = (comment, postId) => (
    <View key={comment.id} style={styles.comment}>
      <View style={styles.commentContent}>
        <Icon
          name="user-circle"
          size={24}
          color="#ccc"
          style={styles.commentIcon}
        />
        <Text style={styles.commentText}>{comment.text}</Text>
      </View>
      <TouchableOpacity onPress={() => deleteComment(postId, comment.id)}>
        <Icon name="trash" size={16} color="red" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => toggleReplySection(comment.id)}>
        <Text style={styles.replyText}>Reply</Text>
      </TouchableOpacity>
      {showReplies[comment.id] && (
        <View style={styles.replyContainer}>
          <TextInput
            style={styles.replyInput}
            placeholder="Add a reply..."
            value={replyText}
            onChangeText={setReplyText}
          />
          <Button title="Post" onPress={() => addReply(postId, comment.id)} />
          {comment.replies.map((reply) =>
            renderReply(reply, postId, comment.id)
          )}
        </View>
      )}
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.postContainer}>
      <View style={styles.header}>
        <Text style={styles.username}>User {item.id}</Text>
      </View>
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.postImage}
        resizeMode="cover"
      />
      <View style={styles.footer}>
        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={() => toggleLike(item)}>
            <Icon
              name="heart"
              size={24}
              color={item.liked ? "#ED4956" : "#262626"}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => toggleCommentSection(item.id)}>
            <Icon name="comment" size={24} color="#262626" />
          </TouchableOpacity>
        </View>
        <Text style={styles.likes}>{item.likes} Likes</Text>
        {showComments[item.id] && (
          <View style={styles.commentsSection}>
            {item.comments.map((comment) => renderComment(comment, item.id))}
            <View style={styles.addCommentContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Add a comment..."
                value={commentText}
                onChangeText={setCommentText}
              />
              <Button title="Post" onPress={() => addComment(item.id)} />
            </View>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        onEndReached={() => setPage((prev) => prev + 1)}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? <ActivityIndicator size="large" color="#0000ff" /> : null
        }
        refreshing={isRefreshing}
        onRefresh={() => {
          setIsRefreshing(true);
          setPage(1);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  postContainer: {
    marginBottom: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 3,
  },
  header: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  username: {
    fontWeight: "bold",
  },
  postImage: {
    width: "100%",
    height: width * 0.5, // Responsive height based on screen width
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  footer: {
    padding: 10,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  likes: {
    marginTop: 5,
    fontWeight: "bold",
  },
  commentsSection: {
    marginTop: 10,
  },
  comment: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  commentContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  commentIcon: {
    marginRight: 5,
  },
  commentText: {
    flex: 1,
  },
  replyText: {
    color: "blue",
    marginLeft: 10,
  },
  replyContainer: {
    marginLeft: 40,
    marginTop: 5,
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 5,
  },
  replyInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 5,
    marginBottom: 5,
  },
  addCommentContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    flex: 1,
    padding: 5,
    marginRight: 10,
  },
  reply: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 5,
  },
  replyContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  replyIcon: {
    marginRight: 5,
  },
  replyText: {
    flex: 1,
    marginLeft: 10,
  },
});

export default FeedScreen;
