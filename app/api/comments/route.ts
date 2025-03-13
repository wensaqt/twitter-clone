import Comment from "@/database/comment.model";
import Notification from "@/database/notification.model";
import Post from "@/database/post.model";
import User from "@/database/user.model";
import { authOptions } from "@/lib/auth-options";
import { connectToDatabase } from "@/lib/mognoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Fonction pour analyser l'image avec Python
async function analyzeImage(imageBase64: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Créer un ID unique pour l'image temporaire
      const imageId = uuidv4();
      const tempDir = path.join(process.cwd(), 'temp');
      
      // Créer le répertoire temp s'il n'existe pas
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      // Chemin du fichier temporaire
      const imagePath = path.join(tempDir, `${imageId}.jpg`);
      
      // Extraire les données d'image de la chaîne base64
      const base64Data = imageBase64.replace(/^data:image\/jpeg;base64,/, "");
      
      // Écrire l'image dans un fichier temporaire
      fs.writeFileSync(imagePath, base64Data, 'base64');
      
      // Lancer le script Python avec spawn
      const pythonProcess = spawn('python', ['print.py', imagePath]);
      
      let pythonOutput = '';
      
      // Récupérer la sortie du script Python
      pythonProcess.stdout.on('data', (data) => {
        pythonOutput += data.toString();
      });
      
      // Gérer les erreurs du script Python
      pythonProcess.stderr.on('data', (data) => {
        console.error(`Python script error: ${data}`);
      });
      
      // Gérer la fin de l'exécution du script
      pythonProcess.on('close', (code) => {
        try {
          // Nettoyer le fichier temporaire
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
          
          if (code !== 0) {
            console.error(`Python process exited with code ${code}`);
            resolve('neutral'); // Valeur par défaut en cas d'erreur
          } else {
            // Analyser la sortie du script Python pour obtenir l'émotion
            const emotion = pythonOutput.trim();
            console.log(`Detected emotion: ${emotion}`);
            resolve(emotion || 'neutral');
          }
        } catch (err) {
          console.error('Error in Python process close handler:', err);
          resolve('neutral');
        }
      });
    } catch (error) {
      console.error('Error in analyzeImage function:', error);
      resolve('neutral'); // Valeur par défaut en cas d'erreur
    }
  });
}

// Fonction pour valider la transmission de l'image vers Python
async function validateImageTransfer(imageBase64: string): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      // Créer un ID unique pour l'image temporaire
      const imageId = uuidv4();
      const tempDir = path.join(process.cwd(), 'temp');
      
      // Créer le répertoire temp s'il n'existe pas
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      // Chemin du fichier temporaire
      const imagePath = path.join(tempDir, `${imageId}.jpg`);
      
      // Extraire les données d'image de la chaîne base64
      const base64Data = imageBase64.replace(/^data:image\/jpeg;base64,/, "");
      
      // Écrire l'image dans un fichier temporaire
      fs.writeFileSync(imagePath, base64Data, 'base64');
      
      console.log(`Image temporaire créée: ${imagePath}`);
      console.log(`Taille du fichier: ${fs.statSync(imagePath).size} octets`);
      
      // Lancer le script Python avec l'option de validation
      const pythonProcess = spawn('python', ['print.py', imagePath, '--validate']);
      
      let pythonOutput = '';
      
      // Récupérer la sortie du script Python
      pythonProcess.stdout.on('data', (data) => {
        pythonOutput += data.toString();
      });
      
      // Gérer les erreurs du script Python
      pythonProcess.stderr.on('data', (data) => {
        console.error(`Validation error: ${data}`);
      });
      
      // Gérer la fin de l'exécution du script
      pythonProcess.on('close', (code) => {
        try {
          // Nettoyer le fichier temporaire
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
          
          if (code !== 0) {
            console.error(`Python process exited with code ${code}`);
            resolve({ 
              success: false, 
              error: `Process exited with code ${code}`,
              pythonOutput 
            });
          } else {
            // Analyser la sortie du script Python
            try {
              const validationResult = JSON.parse(pythonOutput.trim());
              console.log("Validation de la transmission de l'image:", validationResult);
              resolve({ 
                success: validationResult.status === "success",
                ...validationResult 
              });
            } catch (parseError) {
              console.error("Erreur de parsing JSON:", parseError);
              resolve({ 
                success: false, 
                error: "Erreur de parsing JSON",
                rawOutput: pythonOutput 
              });
            }
          }
        } catch (err) {
          console.error('Error in Python process close handler:', err);
          resolve({ success: false, error: String(err) });
        }
      });
    } catch (error) {
      console.error('Error in validateImageTransfer function:', error);
      resolve({ success: false, error: String(error) });
    }
  });
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    
    // Récupérer les données de la requête
    const data = await req.json();
    const { body, postId, userId, imageData } = data;
    
    // Vérifier s'il s'agit d'une réaction émotionnelle (avec imageData)
    if (imageData) {
      if (!session?.currentUser) {
        return NextResponse.json(
          { error: "Vous devez être connecté pour partager une réaction" },
          { status: 401 }
        );
      }
      
      // Valider d'abord la transmission de l'image
      console.log("Validation de la transmission de l'image...");
      const validationResult = await validateImageTransfer(imageData);
      
      if (!validationResult.success) {
        console.error("Échec de la validation:", validationResult);
        return NextResponse.json(
          { error: "Erreur lors de la validation de l'image", details: validationResult },
          { status: 400 }
        );
      }
      
      console.log("Validation réussie! Analyse de l'image...");

      // Analyser l'image avec Python pour détecter l'émotion
      console.log("Analyse de l'image...");
      const detectedEmotion = await analyzeImage(imageData);
      console.log(`Émotion détectée: ${detectedEmotion}`);
      
      // Récupérer l'emoji correspondant à l'émotion
      const emotionEmoji = getEmotionEmoji(detectedEmotion);
      
      // Créer un commentaire spécial pour la réaction émotionnelle
      const reactionComment = await Comment.create({ 
        body: `A réagi avec l'émotion: ${detectedEmotion} ${emotionEmoji}`,
        post: postId, 
        user: session.currentUser._id,
        imageData: imageData,  // Stocker l'image en base64
        emotion: detectedEmotion,
        isEmotionReaction: true
      });
      
      // Mettre à jour le post
      const post = await Post.findByIdAndUpdate(postId, { 
        $push: { comments: reactionComment._id } 
      });
      
      // Créer une notification
      await Notification.create({
        user: String(post.user),
        body: `${session.currentUser.name} a partagé une réaction ${emotionEmoji} à votre post!`,
      });
      
      // Mettre à jour le statut de notification
      await User.findOneAndUpdate(
        { _id: String(post.user) }, 
        { $set: { hasNewNotifications: true } }
      );
      
      return NextResponse.json({ 
        success: true,
        comment: reactionComment,
        emotion: detectedEmotion,
        emoji: emotionEmoji,
        validation: validationResult,
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

// Fonction pour convertir l'émotion détectée en emoji
function getEmotionEmoji(emotion: string): string {
  const emotionMap: Record<string, string> = {
    happy: '😄',
    sad: '😢',
    angry: '😠',
    surprised: '😲',
    fearful: '😨',
    disgusted: '🤢',
    neutral: '😐',
    confused: '🤔',
    laughing: '😂',
    love: '❤️',
    excited: '🤩',
    bored: '😒',
    tired: '😴',
    // Ajoutez d'autres émotions selon les résultats attendus de votre modèle
  };
  
  return emotionMap[emotion.toLowerCase()] || '😐';
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