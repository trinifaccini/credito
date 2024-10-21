import { Component, inject, OnInit } from '@angular/core';
import { BarcodeFormat } from '@zxing/library';
import { AlertController, IonicModule } from '@ionic/angular';
import { Firestore, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { AuthService } from 'src/app/services/auth.service';
import { UserInterface } from 'src/app/models/user.interface';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

import { addIcons } from 'ionicons';
import { close } from 'ionicons/icons';


addIcons({
  'close' : close
});

@Component({
  selector: 'app-qr-scanner',
  standalone: true,
  imports: [IonicModule, CommonModule, ZXingScannerModule ],
  templateUrl: './juego.page.html',
  styleUrls: ['./juego.page.css'],
})

export class GamePage implements OnInit {
  
  authService = inject(AuthService);
  router = inject(Router);
  allowedFormats = [BarcodeFormat.QR_CODE];
  scannedCodes = new Set<string>(); 
  credits = 0;
  user: UserInterface | null = null;
  isScanning = false;
  devices: MediaDeviceInfo[] = [];
  selectedDevice: MediaDeviceInfo | undefined;
  isLoading =  false;


  constructor(private alertController: AlertController, private firestore: Firestore) {}

  ngOnInit() {
    this.getAvailableDevices();
    this.user = this.authService.currentUserSig();
    this.credits = this.user['credito']
  }

  async getAvailableDevices() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.devices = devices.filter(device => device.kind === 'videoinput');
      if (this.devices.length > 0) {
        this.selectedDevice = this.devices[0];
      }
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Error al solicitar acceso a la cámara:', error);
      await this.showAlert('Permiso de Cámara Requerido', 'La aplicación necesita acceso a la cámara para escanear códigos QR.');
    }
  }

  toggleScanner() {

    this.isScanning = !this.isScanning;

  }

  async onCodeResult(resultString: string) {

      this.isLoading = true;
      this.isScanning = false;

      setTimeout(async () => {
  
        const isValidCode = await this.verifyValidCode(resultString);
        if (!isValidCode) {
          await this.showAlert('Código inválido', 'Este código no está registrado en la base de datos.');
        }
      
        const creditValue = this.getCreditValue(resultString);
        if (!creditValue) {
          await this.showAlert('Código inválido', 'Este código no tiene un valor de crédito.');
        }
      
        const userCodeRef = doc(this.firestore, `creditos/${this.user['id']}_${resultString}`);
        const userCodeSnapshot = await getDoc(userCodeRef);
      
        if (userCodeSnapshot.exists()) {
          const data = userCodeSnapshot.data();
          const count = data['contador'] || 0;
      
          if (this.user && this.user.perfil === 'admin') {
            if (count < 2) {
              await setDoc(userCodeRef, { contador: count + 1, creditos: creditValue, codigo: resultString });
              await this.verifyAndShowCredit(userCodeRef, creditValue);
            } else {
              await this.showAlert('Límite alcanzado', 'No puedes cargar este código más de dos veces.');
            }
          } else {
            await this.showAlert('Código ya cargado', 'Este código ya ha sido utilizado.');
          }
        } 
        
        else {
          await setDoc(userCodeRef, { contador: 1, creditos: creditValue, codigo: resultString, id: this.user['id'] });
          await this.verifyAndShowCredit(userCodeRef, creditValue);
        } 

        this.isLoading = false;
      
      }, 2000);
  }

  async verifyAndShowCredit(userCodeRef: any, creditValue: number) {
    const userCodeSnapshot = await getDoc(userCodeRef);

    if (userCodeSnapshot.exists()) {
      const data = userCodeSnapshot.data();

      const userDocRef = doc(this.firestore, `usuarios/${this.user['uid']}`);
      await updateDoc(userDocRef, { credito: this.credits + creditValue });

      this.credits += creditValue;

      await this.showAlert('Crédito Cargado', `Crédito Actual: ${this.credits}`);
    } else {
      await this.showAlert('Error', 'Hubo un problema al cargar el crédito. Inténtalo de nuevo.');
    }
  }

  async verifyValidCode(code: string): Promise<boolean> {
    const validCodeRef = doc(this.firestore, `codigosValidos/${code}`);
    const validCodeSnapshot = await getDoc(validCodeRef);
    return validCodeSnapshot.exists();
  }

  getCreditValue(code: string): number {
    const creditValues: { [key: string]: number } = {
      '8c95def646b6127282ed50454b73240300dccabc': 10,
      'ae338e4e0cbb4e4bcffaf9ce5b409feb8edd5172': 50,
      '2786f4877b9091dcad7f35751bfcf5d5ea712b2f': 100,
    };
    return creditValues[code] || 0;
  }


  async showAlert(header: string, message: string) {
    Swal.fire({
      heightAuto: false,
      title: header,
      text: message,
      icon: 'info', // Puedes cambiar el icono según lo que necesites: 'success', 'error', 'warning', 'info'
      timer: 5000, // Opción para cerrar automáticamente después de 3 segundos
    
    });
  }


  async clearCredits(): Promise<void> {
    if (!this.user) return;

    Swal.fire({
      heightAuto: false,
      title: "CUIDADO",
      text: "¿Estás seguro que querés borrar tus créditos?'",
      icon: 'warning', // Puedes cambiar el icono según lo que necesites: 'success', 'error', 'warning', 'info'
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si',
      cancelButtonText: 'No'
      }).then(async (result) => {
      if (result.value) {
        const userId = this.user['id'];
        const creditsCollection = collection(this.firestore, 'creditos');
        const userCreditsQuery = query(creditsCollection, where('id', '==', userId));
    
        const querySnapshot = await getDocs(userCreditsQuery);
        const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));

        // Actualiza el campo `credito` en la colección `usuarios` a 0
        const userDocRef = doc(this.firestore, `usuarios/${this.user['uid']}`);
        await updateDoc(userDocRef, { credito: 0 });

        // Actualiza el valor local de `credits` y muestra el mensaje
        this.credits = 0;
        await this.showAlert('Créditos limpiados', 'Tus créditos han sido restablecidos a 0.');
      
        await Promise.all(deletePromises);
        console.log('Créditos eliminados para el usuario:', userId);

      } else {
          return false;
      }
  });

    
  }

  logout() {
    this.user = null;
    this.isLoading = false;
    this.isScanning= false;
    this.credits = 0;
    this.authService.logout();
    this.router.navigateByUrl('login');
  }
  
}
