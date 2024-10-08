import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  standalone: true,
  selector: 'app-juego',
  templateUrl: './juego.page.html',
  styleUrls: ['./juego.page.scss'],
  imports: [IonicModule]
})
export class GamePage {
  codeReader = new BrowserMultiFormatReader();
  scanResult: string | null = null;

  constructor() {}

  async requestCameraPermission() {
    const permissions = await Camera.requestPermissions();
    
    if (permissions.camera !== 'granted') {
      alert("Permisos de cámara no concedidos");
      return false;
    }
    return true;
  }

  async scanQRCode() {
    const hasPermission = await this.requestCameraPermission();
    if (!hasPermission) {
      return;
    }

    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64, // Cambiado a Base64
        source: CameraSource.Camera
      });

      if (image && image.dataUrl) {
        this.decodeQRCode(image.dataUrl);
      } else {
        alert("No se pudo capturar la imagen.");
      }
    } catch (error) {
      alert("No se pudo acceder a la cámara");
      console.error("Error al acceder a la cámara:", error.message || error);
    }
  }

  async decodeQRCode(base64: string) {
    try {
      const dataUrl = `data:image/jpeg;base64,${base64}`;
      const result = await this.codeReader.decodeFromImageUrl(dataUrl);
      this.scanResult = result.getText();
      alert(`Código QR decodificado: ${this.scanResult}`);
    } catch (error) {
      this.scanResult = null;
      alert("No se pudo decodificar el código QR.");
      console.error("Error al decodificar el código QR:", error);
    }
  }
  
}
