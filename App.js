import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Image, Button, TouchableOpacity } from 'react-native';
import { Camera } from 'expo-camera'
import * as MediaLibrary from 'expo-media-library'
import bgImg from './assets/nutrition.jpg'
import cameraIcon from './assets/camera.png'
import axios from 'axios';

export default function App() {
  const [capturedImage, setCapturedImage] = useState(null)
  const [hasCameraPermission, setHasCameraPermission] = useState(null)
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState();
  const [isCameraOpened, setIsCameraOpened] = useState(false)
  const [type, setType] = useState(Camera.Constants.Type.back)
  const [flash, setFlash] = useState(Camera.Constants.FlashMode.off)
  const cameraRef = useRef(null)

  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
      setHasCameraPermission(cameraPermission.status === "granted");
      setHasMediaLibraryPermission(mediaLibraryPermission.status === "granted");
    })();
  }, [])

  const takePicture = async () => {
    if (cameraRef.current) {
      const options = { quality: 1, base64: true, skipProcessing: true };
      try {
        const data = await cameraRef.current.takePictureAsync(options)
        setCapturedImage(data.uri)
      } catch (e) {
        console.log(e)
      }
    }
  }

  const reset = () => {
    setCapturedImage(null)
  }
  const proceedOCR = async () => {
    // const formData = new FormData();
    // formData.append('image', {
    //   uri: capturedImage,
    //   type: 'image/jpeg',
    //   name: 'image.jpg',
    // });
    // try {
    //   const response = await fetch('http://192.168.137.1:8000/upload', {
    //     method: 'POST',
    //     body: formData,
    //     headers: {
    //       'Content-Type': 'multipart/form-data',
    //     },
    //   });

    //   if (response.ok) {
    //     const data = await response.json();
    //     console.log(data);
    //   } else {
    //     console.error('Failed to upload image:', response.status);
    //   }
    // } catch (error) {
    //   console.error('Error uploading image:', error);
    // }

    const formData = new FormData();
    formData.append('image', {
      uri: capturedImage,
      type: 'image/jpeg',
      name: 'image.jpg',
    });

    try {
      const response = await axios.post('http://192.168.137.1:8000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        const data = response.data;
        console.log(data);
      } else {
        console.error('Failed to upload image:', response.status);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }

  }

  return (
    <View style={styles.container}>
      <Image source={bgImg} style={styles.bgImg} />
      <Text style={styles.title}>NutriCheck</Text>
      <TouchableOpacity onPress={() => setIsCameraOpened(true)}>
        <View style={styles.iconContainer}>
          <Image source={cameraIcon} style={styles.icon} />
          <Text style={styles.iconTitle}>Open Camera</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.cameraContainer}>
        {!capturedImage && isCameraOpened ? (
          <View style={{ width: '100%', height: '100%', alignItems: 'center' }}>
            <Camera
              style={styles.camera}
              type={type}
              flashMode={flash}
              ref={cameraRef}
              autoFocus={Camera.Constants.AutoFocus.on}
            >
              <Button title="Take Picture" onPress={takePicture} />
            </Camera>
            <TouchableOpacity onPress={() => setIsCameraOpened(false)} style={styles.closeCamera}>
              <Text style={{ fontSize: 30, fontWeight: '600' }}>X</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Image source={{ uri: capturedImage }} style={styles.image} />
        )}
      </View>

      {
        capturedImage && (
          <View style={{ flexDirection: 'row', gap: 20 }}>
            <Button title="Retake" onPress={reset} />
            <Button title="Proceed" onPress={proceedOCR} />
          </View>
        )
      }

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: 5,
    color: '#f4acb7',
    marginTop: 40
  },
  bgImg: {
    position: 'absolute',
    zIndex: -1,
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  camera: {
    width: '80%',
    height: '90%',
    borderRadius: 20
  },
  cameraContainer: {
    marginTop: 40,
    width: '100%',
    height: '60%',
    alignItems: 'center',
  },
  image: {
    width: 400,
    height: 400,
  },
  icon: {
    width: 60,
    height: 60,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  iconTitle: {
    fontSize: 20,
    fontWeight: '600'
  },
  closeCamera: {
    width: 50,
    height: 50,
    backgroundColor: 'white',
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
  }
});
