import { inject, Injectable, signal } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, user } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { UserInterface } from '../models/user.interface';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  
  firebaseAuth = inject(Auth);
  firestore = inject(Firestore);
  user$ = user(this.firebaseAuth);
  currentUserSig = signal<UserInterface | null | undefined>(undefined);

  login(email: string, password: string): Observable<void> {
    const promise = signInWithEmailAndPassword(this.firebaseAuth, email, password)
      .then((userCredential) => {
        // Después de iniciar sesión, obtener la información del usuario en Firestore
        return this.getUserData(userCredential.user.uid);
      })
      .then((userData) => {
        this.currentUserSig.set(userData);
      });
    return from(promise);
  }

  logout(): Observable<void> {
    const promise = signOut(this.firebaseAuth)
      .then(() => {
        this.currentUserSig.set(null);
      });
    return from(promise);
  }

  // Método para obtener el usuario desde Firestore
  private async getUserData(uid: string): Promise<UserInterface | null> {

    const userDocRef = doc(this.firestore, `usuarios/${uid}`);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        uid: uid,
        id: data['id'],
        correo: data['correo'],
        perfil: data['perfil'],
        credito: data['credito']
      } as UserInterface;
    } else {
      console.warn('No se encontró el documento de usuario en Firestore');
      return null;
    }
  }
}
