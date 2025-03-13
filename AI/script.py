#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import os
import json

import numpy as np
from PIL import Image
import base64
import hashlib

from tensorflow.keras.models import load_model
from transformers import pipeline
from keras._tf_keras.keras.preprocessing import image


# Fonction pour valider la communication et l'intégrité de l'image
def validate_image_transfer(image_path):
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
    try:
        # Ouvrir l'image pour vérifier qu'elle est valide
        img = image.load_img(image_path, target_size=(48, 48), color_mode='grayscale')
        img_array = np.array(img)
        np.expand_dims(img_array, axis=0)
        img_array = np.resize(img_array, (48, 48, 1))
        img_array = np.expand_dims(img_array, axis=0)
        
        # Appel du modèle ia
        # model = load_model(os.path.abspath('../twitter/AI/emotion_model.keras'))
        # result = model.predict(img_array)
        # classes = {0: 'Angry', 1: 'Fear', 2: 'Happy', 3: 'Neutral', 4: 'Sad', 5: 'Surprise'}
        # detected_emotion = classes[np.argmax(result)]

        # Utilisation de Hugging Face
        pipe = pipeline("image-classification", model="dima806/facial_emotions_image_detection")
        result = pipe(images=image_path, top_k=1)
        
        # Pour ce modèle de démonstration, on renvoie une émotion aléatoire
        detected_emotion = result[0]['label']

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