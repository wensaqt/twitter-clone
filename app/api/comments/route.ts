import Comment from "@/database/comment.model";
import Notification from "@/database/notification.model";
import Post from "@/database/post.model";
import User from "@/database/user.model";
import { authOptions } from "@/lib/auth-options";
import { connectToDatabase } from "@/lib/mognoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// export async function POST(req: Request) {
//   try {
//     await connectToDatabase();
//     const { body, postId, userId } = await req.json();
//     const comment = await Comment.create({ body, post: postId, user: userId });
//     const post = await Post.findByIdAndUpdate(postId, {
//       $push: { comments: comment._id },
//     });

//     await Notification.create({
//       user: String(post.user),
//       body: "Quelqu'un a répondu à votre post !",
//     });

//     await User.findOneAndUpdate(
//       { _id: String(post.user) },
//       { $set: { hasNewNotifications: true } }
//     );

//     return NextResponse.json(comment);
//   } catch (error) {
//     const result = error as Error;
//     return NextResponse.json({ error: result.message }, { status: 400 });
//   }
// }

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    
    // Récupérer les données de la requête
    const data = await req.json();
    const { body, postId, userId, imageData, emotion } = data;
    
    // Vérifier s'il s'agit d'une réaction émotionnelle (avec imageData)
    if (imageData) {
      if (!session?.currentUser) {
        return NextResponse.json(
          { error: "Vous devez être connecté pour partager une réaction" },
          { status: 401 }
        );
      }
      
      // Créer un commentaire spécial pour la réaction émotionnelle
      const reactionComment = await Comment.create({ 
        body: emotion ? `A réagi avec l'émotion: ${emotion}` : "A partagé une réaction",
        post: postId, 
        user: session.currentUser._id,
        imageData: imageData,  // Stocker l'image en base64
        emotion: emotion || null,
        isEmotionReaction: true
      });
      
      // Mettre à jour le post
      const post = await Post.findByIdAndUpdate(postId, { 
        $push: { comments: reactionComment._id } 
      });
      
      // Créer une notification
      await Notification.create({
        user: String(post.user),
        body: `${session.currentUser.name} a partagé une réaction à votre post!`,
      });
      
      // Mettre à jour le statut de notification
      await User.findOneAndUpdate(
        { _id: String(post.user) }, 
        { $set: { hasNewNotifications: true } }
      );
      
      return NextResponse.json({ 
        success: true,
        comment: reactionComment,
        message: "Réaction partagée avec succès"
      });
    } 
    // Traitement standard des commentaires textuels
    else {
      const comment = await Comment.create({ body, post: postId, user: userId });
      const post = await Post.findByIdAndUpdate(postId, {
        $push: { comments: comment._id },
      });

      await Notification.create({
        user: String(post.user),
        body: "Quelqu'un a répondu à votre post !",
      });

      await User.findOneAndUpdate(
        { _id: String(post.user) },
        { $set: { hasNewNotifications: true } }
      );

      return NextResponse.json(comment);
    }
  } catch (error) {
    const result = error as Error;
    return NextResponse.json({ error: result.message }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectToDatabase();
    const { currentUser }: any = await getServerSession(authOptions);
    const { commentId } = await req.json();

    const comment = await Comment.findByIdAndUpdate(commentId, {
      $push: { likes: currentUser._id },
    });

    await Notification.create({
      user: String(comment.user),
      body: "Quelqu'un a like votre réponse au post!",
    });

    await User.findOneAndUpdate(
      { _id: String(comment.user) },
      { $set: { hasNewNotifications: true } }
    );

    return NextResponse.json({ message: "Commentaire aimé" });
  } catch (error) {
    const result = error as Error;
    return NextResponse.json({ error: result.message }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectToDatabase();
    const { currentUser }: any = await getServerSession(authOptions);
    const { commentId } = await req.json();

    await Comment.findByIdAndUpdate(commentId, {
      $pull: { likes: currentUser._id },
    });

    return NextResponse.json({ message: "Commentaire aimé" });
  } catch (error) {
    const result = error as Error;
    return NextResponse.json({ error: result.message }, { status: 400 });
  }
}
