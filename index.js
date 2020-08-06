const express = require("express");
const mongoose = require("mongoose");
const Post = require("./models/Post");
const User = require("./models/User");
require("dotenv").config();
const { graphqlHTTP } = require("express-graphql");
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphLQLNonNull,
  GraphQLNonNull,
} = require("graphql");

const { ApolloServer } = require("apollo-server-express");

const cors = require("cors");

const app = express();

app.use(cors());

//type
const UserType = new GraphQLObjectType({
  name: "users",
  description: "users",
  fields: () => ({
    username: {
      type: GraphQLString,
      description: "username",
    },
    posts: {
      type: new GraphQLList(PostType),
      description: "posts from a user",
      resolve: async user => await Post.find({ username: user.username }),
    },
  }),
});

const PostType = new GraphQLObjectType({
  name: "posts",
  description: "posts",
  fields: () => ({
    username: {
      type: GraphQLString,
      description: "user that posted",
    },
    title: {
      type: GraphQLString,
      description: "post title",
    },
    content: {
      type: GraphQLString,
      description: "post content",
    },
  }),
});

const SingleUserType = new GraphQLObjectType({
  name: "SingleUser",
  description: "info on a single user",
  fields: () => ({
    username: {
      type: GraphQLString,
    },
    posts: {
      type: GraphQLList(PostType),
      resolve: async user => await Post.find({ username: user.username }),
    },
  }),
});

//query
const rootQueryType = new GraphQLObjectType({
  name: "GetUsersAndPosts",
  description: "root query",
  fields: () => ({
    users: {
      type: new GraphQLList(UserType),
      description: "list of users",
      resolve: async () => await User.find(),
    },

    posts: {
      type: new GraphQLList(PostType),
      description: "list of posts",
      resolve: async () => await Post.find(),
    },

    singleUser: {
      type: new GraphQLList(SingleUserType),
      description: "info on a specific user",
      args: {
        username: {
          type: GraphQLNonNull(GraphQLString),
        },
      },
      resolve: async (parent, args) =>
        await User.find({ username: args.username }),
    },
  }),
});

//mutation
const rootMutationType = new GraphQLObjectType({
  name: "AddUserAndPost",
  description: "root mutation",
  fields: () => ({
    addUser: {
      type: UserType,
      description: "add an user",
      args: {
        username: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: (parent, args) => {
        const newUser = new User({
          username: args.username,
        });
        newUser.save();
        return newUser;
      },
    },

    addPost: {
      type: PostType,
      description: "add a post",
      args: {
        username: { type: GraphQLNonNull(GraphQLString) },
        title: { type: GraphQLNonNull(GraphQLString) },
        content: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: (parent, args) => {
        const newPost = new Post({
          username: args.username,
          title: args.title,
          content: args.content,
        });
        newPost.save();
        return newPost;
      },
    },
  }),
});

const schema = new GraphQLSchema({
  query: rootQueryType,
  mutation: rootMutationType,
});

const server = new ApolloServer({ schema });

app.use("/graphql", graphqlHTTP({ schema: schema, graphiql: true }));

server.applyMiddleware({ app });

mongoose
  .connect(process.env.MONGO_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => app.listen(process.env.PORT || 5000))
  .catch(err => console.log(err));
