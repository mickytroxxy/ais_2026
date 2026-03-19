import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, query, where, deleteDoc, updateDoc, onSnapshot   } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import socketIOClient from "socket.io-client";
import * as Network from 'expo-network';
import * as st from "firebase/storage";
import axios from 'axios';
let socket;
const firebaseConfig = {
    apiKey: "AIzaSyCn2Xi_cC-QOoelq-ZUOyRf6OMnB8aVjgs",
    authDomain: "aissnapshot.firebaseapp.com",
    projectId: "aissnapshot",
    storageBucket: "aissnapshot.appspot.com",
    messagingSenderId: "432055632242",
    appId: "1:432055632242:web:6480fe488bb1796f681deb"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore();

export const createData = async (tableName,docId,data) => {
    try {
        await setDoc(doc(db, tableName, docId), data);
        return true;
    } catch (e) {
        alert(e)
        return false;
    }
}
export const getNetworkStatus = async(cb)=>{
    try {
        if(socket){
            cb(socket,"http://154.117.189.170:3000");
        }else{
            socket = await socketIOClient("http://154.117.189.170:3000");
            cb(socket,"http://154.117.189.170:3000");
        }
    } catch (error) {
        showToast(error)
    }
}
export const userLogin = async (branch,password,cb) => {
    try {
        getNetworkStatus((socket)=>{
            socket.emit("login",branch,password,(result)=>{
                cb(result);
            })
        })
    } catch (e) {
        cb(e);
    }
}
export const getComments = async (Key_Ref,cb) => {
    try {
        getNetworkStatus((socket)=>{
            socket.emit("getComments",Key_Ref,(result)=>{
                cb(result);
            })
        })
    } catch (e) {
        cb(e);
    }
}
export const getNotificationTokens = async (cb) => {
    try {
        const querySnapshot = await getDocs(query(collection(db, "mag_notifications")));
        const data = querySnapshot.docs.map(doc => doc.data());
        cb(data)
    } catch (e) {
        cb(e);
    }
}
export const getTowingRequests = async (cb) => {
    try {
        const querySnapshot = await getDocs(query(collection(db, "towingRequests")));
        const data = querySnapshot.docs.map(doc => doc.data());
        cb(data)
    } catch (e) {
        cb(e);
    }
}
export const sendPushNotification = async (to,title,body,data)=> {
    if(to!=null || to!=undefined || to!=""){
        const message = {
            to: to,
            sound: 'default',
            title: title,
            body: body,
            data,
            priority: 'high',
        };
        try {
            await fetch('https://exp.host/--/api/v2/push/send', {
                method: 'POST',
                headers: {
                Accept: 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
                },
                body: JSON.stringify(message),
            });
        } catch (error) {}
    }
}
export const getKeyRef = async (Key_Ref,cb) => {
    try {
        getNetworkStatus((socket)=>{
            socket.emit("search-keyRef",Key_Ref,true,(result)=>{
                cb(result)
            });
        })
    } catch (e) {
        cb(e);
    }
}
export const getDirectories = async (cb) => {
    try {
        const querySnapshot = await getDocs(query(collection(db, "directory")));
        const data = querySnapshot.docs.map(doc => doc.data());
        cb(data)
    } catch (e) {
        cb(e);
    }
}
export const getGallery = async (phoneNumber,cb) => {
    try {
        const querySnapshot = await getDocs(query(collection(db, "gallery"), where("businessId", "==", phoneNumber)));
        const data = querySnapshot.docs.map(doc => doc.data());
        cb(data)
    } catch (e) {
        cb(e);
    }
}
export const getNotice = async (cb) => {
    try {
        const querySnapshot = await getDocs(query(collection(db, "notice")));
        const data = querySnapshot.docs.map(doc => doc.data());
        cb(data)
    } catch (e) {
        cb(e);
    }
}
export const getPrecostingData = ({Key_Ref},cb)=>{
    getNetworkStatus((socket)=>{
        socket.emit("getPrecosting",Key_Ref,(result)=>{
            cb(result)  
        });
    })
}
export const getBookingPhotos = (activeKeyRef,cb) =>{
    getNetworkStatus((socket,url)=>{
        socket.emit("getBookings",activeKeyRef,(result)=>{
            cb(result)
        })
    })
}
export const getOtherPhotos = (category,activeKeyRef,cb) =>{
    getNetworkStatus((socket,url)=>{
        socket.emit("getOtherPhotos",activeKeyRef,category,(result)=>{
            cb(result);
        })
    })
}
export const getFaqs = async (cb) => {
    try {
        const querySnapshot = await getDocs(query(collection(db, "faqs")));
        const data = querySnapshot.docs.map(doc => doc.data());
        cb(data)
    } catch (e) {
        cb(e);
    }
}
export const getComplaints = async (cb) => {
    try {
        const querySnapshot = await getDocs(query(collection(db, "complaints")));
        const data = querySnapshot.docs.map(doc => doc.data());
        cb(data)
    } catch (e) {
        cb(e);
    }
}
export const CooperateLogin = async (phoneNumber,password,cb) => {
    try {
        const querySnapshot = await getDocs(query(collection(db, "companies"), where("phoneNumber", "==", phoneNumber),  where("password", "==", password)));
        const data = querySnapshot.docs.map(doc => doc.data());
        cb(data)
    } catch (e) {
        cb(e);
    }
}
export const getVehicles = async (phoneNumber,cb) => {
    try {
        const querySnapshot = await getDocs(query(collection(db, "vehicles"), where("companyOwner", "==", phoneNumber)));
        const data = querySnapshot.docs.map(doc => doc.data());
        cb(data)
    } catch (e) {
        cb(e);
    }
}
export const getCarData= async (Key_Ref,cb) => {
    try {
        const querySnapshot = await getDocs(query(collection(db, "vehicles"), where("regNumber", "==", Key_Ref)));
        const data = querySnapshot.docs.map(doc => doc.data());
        cb(data)
    } catch (e) {
        cb(e);
    }
}
export const getChats = async (cb) => {
    try {
        const unsubscribe = onSnapshot(query(collection(db, "chats")), (querySnapshot) => {
            const messagesFireStore = querySnapshot.docChanges().map(({doc})=>{
                const message = doc.data();
                return {...message,createdAt:message.createdAt.toDate()}
            }).sort((a,b)=>b.createdAt.getTime()-a.createdAt.getTime())
            cb(messagesFireStore)
        });
        return () => unsubscribe();
    } catch (e) {
        cb(e);
    }
}
export const getMessages = async (user,cb) => {
    try {
        const unsubscribe = onSnapshot(query(collection(db, "chats"),  where("uniqueUser", "==", user)), (querySnapshot) => {
            const messagesFireStore = querySnapshot.docChanges().filter(({type})=>type=='added').map(({doc})=>{
                const message = doc.data();
                return {...message,createdAt:message.createdAt.toDate()}
            }).sort((a,b)=>b.createdAt.getTime()-a.createdAt.getTime())
            cb(messagesFireStore)
        });
        return () => unsubscribe();
    } catch (e) {
        cb(e);
    }
}
export const getMedia = async (cb) => {
    try {
        const querySnapshot = await getDocs(query(collection(db, "media")));
        const data = querySnapshot.docs.map(doc => doc.data());
        cb(data)
    } catch (e) {
        cb(e);
    }
}
export const getEvents = async (cb) => {
    try {
        const querySnapshot = await getDocs(query(collection(db, "events")));
        const data = querySnapshot.docs.map(doc => doc.data());
        cb(data)
    } catch (e) {
        cb(e);
    }
}
export const deleteData = async (tableName,docId) => {
    try {
        const q = await deleteDoc(doc(db, tableName, docId));
        return q;
    } catch (e) {
        return false;
    }
}
export const updateTable = async (tableName,docId,obj) => {
    try {
        const docRef = doc(db, tableName, docId);
        await updateDoc(docRef, obj);
        return true;
    } catch (e) {
        return false;
    }
}
const addFile = async (file,path,cb) =>{
    const storage = st.getStorage(app);
    const fileRef = st.ref(storage, path);
    const response = await fetch(file);
    const blob = await response.blob();
    const uploadTask = await st.uploadBytesResumable(fileRef, blob);
    const url = await st.getDownloadURL(uploadTask.ref);
    cb(url)
}
export const uploadFile = async (uri,category,activeKeyRef,namePrefix,cb)=>{
    const apiUrl = "http://154.117.189.170:3000/upload";
    const name = uri.substr(uri.lastIndexOf('/') + 1);
    let filePath = "../mag_qoutation/photos/"+activeKeyRef+"/"+activeKeyRef + Math.floor(Math.random()*899999+100000) +".jpg";
    //http://154.117.189.170:8080/mag_qoutation/photos/S395/S395882503.jpg
    if(category=="BOOKING PHOTOS"){
        filePath = "../mag_qoutation/mag_snapshot/security_images/"+activeKeyRef+"/"+namePrefix + Math.floor(Math.random()*899999+100000)+".jpg";
    }
    const formData = new FormData();
    formData.append('fileUrl', {uri,name,type: `image/jpg`});
    formData.append('filePath', filePath);
    try {
        const response = await axios({
            method: "post",
            url: apiUrl,
            data: formData,
            headers: { "Content-Type": "multipart/form-data" },
        });
        cb(response.status,filePath);
    } catch(error) {
        console.log(error)
        uploadFile(uri,category,activeKeyRef,namePrefix,cb)
        //cb(200,filePath);
    }
}