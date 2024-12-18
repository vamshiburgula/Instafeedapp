import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

interface Post {
  imageUrl: string;
  caption: string;
}

interface FeedItemProps {
  post: Post;
}

const FeedItem: React.FC<FeedItemProps> = ({ post }) => {
  return (
    <View style={styles.container}>
      <Image source={{ uri: post.imageUrl }} style={styles.image} />
      <Text style={styles.caption}>{post.caption}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  image: {
    width: "100%",
    height: 250,
  },
  caption: {
    marginVertical: 10,
    fontSize: 16,
  },
});

export default FeedItem;
