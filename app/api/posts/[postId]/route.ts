import Post from "@/database/post.model";
import User from "@/database/user.model";
import { connectToDatabase } from "@/lib/mognoose";
import { NextResponse } from "next/server";

export async function GET(req: Request, route: { params: { postId: string } }) {
  try {
    await connectToDatabase();
    const { postId } = route.params;

    const post = await Post.findById(postId).populate({
      path: "user",
      model: User,
      select: "name email profileImage _id username",
    });

    const formattedPost = {
      _id: post._id,
      body: post.body,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      user: {
        _id: post.user._id,
        name: post.user.name,
        username: post.user.username,
        profileImage: post.user.profileImage,
        email: post.user.email,
      },
      likes: post.likes.length,
      comments: post.comments.length,
      mediaUrl: post.mediaUrl || null,
      mediaType: post.mediaType || null
    };

    return NextResponse.json(formattedPost);
  } catch (error) {
    const result = error as Error;
    return NextResponse.json({ error: result.message }, { status: 400 });
  }
}
