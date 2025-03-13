#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import os
import json
from PIL import Image
import base64
import hashlib

# Fonction pour valider la communication et l'intégrité de l'image
def validate_image_transfer(image_path):
    """
    Valide l'intégrité de l'image et renvoie des métadonnées pour confirmer
    que la communication entre Node.js et Python fonctionne correctement.
    """
    try:
        # Vérifier que le fichier existe
        if not os.path.exists(image_path):
            return {
                "status": "error",
                "message": "Le fichier n'existe pas",
                "path": image_path
            }
            
        # Ouvrir l'image et extraire des métadonnées
        img = Image.open(image_path)
        
        # Calculer un hash simple de l'image pour vérifier l'intégrité
        img_hash = hashlib.md5(open(image_path, 'rb').read()).hexdigest()
        
        # Renvoyer des informations sur l'image
        return {
            "status": "success",
            "format": img.format,
            "size": img.size,
            "mode": img.mode,
            "hash": img_hash[:10],  # Premiers 10 caractères du hash MD5
            "path": image_path
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "path": image_path
        }

# Fonction pour analyser l'image et détecter l'émotion
def analyze_image(image_path):
    """
    Fonction qui analyse une image et renvoie l'émotion détectée
    À remplacer par l'appel à votre modèle d'IA
    """
    try:
        # Ouvrir l'image pour vérifier qu'elle est valide
        img = Image.open(image_path)
        
        # À ce stade, vous devriez appeler votre modèle d'IA
        # Exemple fictif :
        # model = load_model("chemin/vers/votre/modele")
        # emotion = model.predict(img)
        
        # Pour ce modèle de démonstration, on renvoie une émotion aléatoire
        import random
        emotions = ["happy", "sad", "neutral", "surprised", "angry"]
        detected_emotion = random.choice(emotions)
        
        return detected_emotion
        
    except Exception as e:
        print(f"Erreur lors de l'analyse de l'image: {str(e)}", file=sys.stderr)
        return "neutral"  # Valeur par défaut en cas d'erreur

if __name__ == "__main__":
    # Vérifier les arguments
    if len(sys.argv) < 2:
        print("Usage: python print.py <image_path> [--validate]", file=sys.stderr)
        sys.exit(1)
    
    image_path = sys.argv[1]
    
    # Vérifier le mode de fonctionnement
    validate_mode = "--validate" in sys.argv
    
    if validate_mode:
        # Mode validation: renvoyer des métadonnées détaillées sur l'image
        validation_result = validate_image_transfer(image_path)
        print(json.dumps(validation_result))
    else:
        # Mode normal: analyser l'image et renvoyer l'émotion
        emotion = analyze_image(image_path)
        print(emotion)
    
    sys.exit(0)