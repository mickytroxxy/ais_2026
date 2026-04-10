import axios from "axios";
import { initializeApp } from "firebase/app";
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
  setDoc,
} from "firebase/firestore";
import socketIOClient from "socket.io-client";
import { FIREBASE_CONFIG } from "./FirebaseConfig";

let socket: any;

const app = initializeApp(FIREBASE_CONFIG);
const db = getFirestore();

export const createData = async (
  tableName: string,
  docId: string,
  data: any,
) => {
  try {
    await setDoc(doc(db, tableName, docId), data);
    return true;
  } catch (e) {
    alert(e);
    return false;
  }
};

export const getNetworkStatus = async (
  cb: (socket: any, url: string) => void,
) => {
  const SERVER_URL = "http://154.117.189.170:3000";
  const FALLBACK_URL = "http://41.169.31.194:3000";
  const MAX_TRIALS = 3;

  const tryConnect = (
    url: string,
    trial: number,
  ): Promise<{ socket: any; url: string }> => {
    return new Promise((resolve, reject) => {
      console.log(
        `[Socket] Trial ${trial}/${MAX_TRIALS} connecting to ${url}...`,
      );

      // Ensure previous socket is disconnected
      if (socket) {
        socket.disconnect();
        socket = null;
      }

      const tempSocket = socketIOClient(url, {
        timeout: 5000, // 5 second timeout
        reconnection: false,
        forceNew: true,
        transports: ["websocket", "polling"], // Try websocket first, fallback to polling
      });

      const timeout = setTimeout(() => {
        if (tempSocket && !tempSocket.connected) {
          tempSocket.disconnect();
        }
        if (trial < MAX_TRIALS) {
          console.log(`[Socket] Trial ${trial} timed out, will retry...`);
          reject(new Error("timeout"));
        } else {
          reject(
            new Error(
              `Connection timeout to ${url} after ${MAX_TRIALS} trials`,
            ),
          );
        }
      }, 5000);

      tempSocket.on("connect", () => {
        clearTimeout(timeout);
        tempSocket.off("connect_error");
        tempSocket.off("disconnect");
        console.log(`[Socket] Connected to ${url}`);
        resolve({ socket: tempSocket, url });
      });

      tempSocket.on("connect_error", (error: any) => {
        clearTimeout(timeout);
        console.error(
          `[Socket] Trial ${trial} connect_error to ${url}:`,
          error.message,
        );
        // Don't disconnect here, let the cleanup happen in the catch block
        if (trial < MAX_TRIALS) {
          reject(new Error("retry"));
        } else {
          reject(error);
        }
      });

      tempSocket.on("disconnect", (reason: string) => {
        console.log(`[Socket] Disconnected from ${url}:`, reason);
      });

      tempSocket.on("error", (error: any) => {
        console.error(`[Socket] Error on ${url}:`, error);
      });
    });
  };

  const connectWithRetry = async (
    url: string,
    isFallback: boolean = false,
  ): Promise<{ socket: any; url: string }> => {
    for (let trial = 1; trial <= MAX_TRIALS; trial++) {
      try {
        const result = await tryConnect(url, trial);
        return result;
      } catch (error: any) {
        console.log(
          `[Socket] Trial ${trial} failed for ${url}:`,
          error.message,
        );

        // Ensure cleanup on error
        if (socket) {
          try {
            socket.disconnect();
          } catch (e) {
            // Ignore disconnect errors
          }
          socket = null;
        }

        if (trial === MAX_TRIALS) {
          if (isFallback) {
            throw error; // Both URLs failed
          } else {
            throw error; // Will try fallback
          }
        }
        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
    throw new Error(`Failed to connect after ${MAX_TRIALS} trials`);
  };

  try {
    // Check if existing socket is valid and connected
    if (socket && socket.connected) {
      console.log("[Socket] Reusing existing connected socket");
      cb(socket, SERVER_URL);
      return;
    }

    // Socket exists but not connected - disconnect it first
    if (socket) {
      console.log(
        "[Socket] Existing socket not connected, disconnecting and reconnecting...",
      );
      try {
        socket.disconnect();
      } catch (e) {
        console.log("[Socket] Error disconnecting existing socket:", e);
      }
      socket = null;
    }

    try {
      // Try primary URL first
      const result = await connectWithRetry(SERVER_URL);
      socket = result.socket;
      cb(socket, result.url);
    } catch (primaryError: any) {
      console.log(
        "[Socket] Primary URL failed, trying fallback...",
        primaryError?.message,
      );
      try {
        // Try fallback URL
        const result = await connectWithRetry(FALLBACK_URL, true);
        socket = result.socket;
        cb(socket, result.url);
      } catch (fallbackError: any) {
        console.error(
          "[Socket] Both URLs failed:",
          fallbackError?.message || fallbackError,
        );
        // Call callback with null socket instead of crashing
        cb(null, "");
      }
    }
  } catch (error: any) {
    console.error("[Socket] getNetworkStatus error:", error?.message || error);
    // Always call the callback to prevent crashes
    cb(null, "");
  }
};

export const userLogin = async (
  branch: string,
  password: string,
  cb: (result: any) => void,
) => {
  try {
    getNetworkStatus((socket) => {
      socket.emit("authenticate", branch, password, (result: any) => {
        cb(result);
      });
    });
  } catch (e) {
    cb(e);
  }
};

export const CooperateLogin = async (
  username: string,
  password: string,
  cb: (result: any) => void,
) => {
  try {
    getNetworkStatus((socket) => {
      socket.emit("cooperateLogin", username, password, (result: any) => {
        cb(result);
      });
    });
  } catch (e) {
    cb(e);
  }
};

export const getKeyRef = async (keyRef: string, cb: (result: any) => void) => {
  try {
    getNetworkStatus((socket) => {
      socket.emit("search-keyRef", keyRef, (result: any) => {
        console.log("getKeyRef", keyRef, result);
        cb(result);
      });
    });
  } catch (e) {
    cb(e);
  }
};

export const getCarData = async (keyRef: string, cb: (result: any) => void) => {
  console.log("getCarData called with keyRef:", keyRef);
  try {
    getNetworkStatus((socket) => {
      socket.emit("getCarData", keyRef, (result: any) => {
        console.log("getCarData result for keyRef", keyRef, result);
        cb(result);
      });
    });
  } catch (e) {
    cb(e);
  }
};

export const getPrecostingData = async (
  carObj: any,
  cb: (result: any) => void,
) => {
  try {
    getNetworkStatus((socket) => {
      socket.emit("getPrecostingData", carObj.Key_Ref, (result: any) => {
        cb(result);
      });
    });
  } catch (e) {
    cb(e);
  }
};

export const getBookingPhotos = (
  activeKeyRef: string,
  cb: (result: any[], url: string) => void,
) => {
  getNetworkStatus((socket, url) => {
    socket.emit("getBookings", activeKeyRef, (result: any[]) => {
      cb(result, url);
    });
  });
};

export const getOtherPhotos = (
  category: string,
  activeKeyRef: string,
  cb: (result: any[], url: string) => void,
) => {
  getNetworkStatus((socket, url) => {
    socket.emit("getOtherPhotos", activeKeyRef, category, (result: any[]) => {
      cb(result, url);
    });
  });
};

export const uploadFile = async (
  uri: string,
  category: string,
  activeKeyRef: string,
  namePrefix: string,
  cb: (status: number, filePath: string) => void,
  fileType: "image" | "pdf" = "image",
) => {
  const API_URL = "http://154.117.189.170:3000/upload";
  const FALLBACK_API_URL = "http://41.169.31.194:3000/upload";
  const name = uri.substr(uri.lastIndexOf("/") + 1);

  // Determine file extension based on file type
  const extension = fileType === "pdf" ? ".pdf" : ".jpg";
  const mimeType = fileType === "pdf" ? "application/pdf" : "image/jpg";

  let filePath =
    "../mag_qoutation/photos/" +
    activeKeyRef +
    "/" +
    activeKeyRef +
    Math.floor(Math.random() * 899999 + 100000) +
    extension;

  if (category == "SECURITY PHOTOS") {
    filePath =
      "../mag_qoutation/mag_snapshot/security_images/" +
      activeKeyRef +
      "/" +
      namePrefix +
      Math.floor(Math.random() * 899999 + 100000) +
      extension;
  }

  console.log("Constructed filePath:", filePath);
  const formData = new FormData();
  formData.append("fileUrl", { uri, name, type: mimeType } as any);
  formData.append("filePath", filePath);
  formData.append("fileType", fileType); // Send file type to server for conversion

  const tryUpload = async (url: string): Promise<boolean> => {
    try {
      const response = await axios({
        method: "post",
        url,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });
      cb(response.status, filePath);
      return true;
    } catch (error) {
      console.log(`Upload failed for ${url}:`, error);
      return false;
    }
  };

  // Try primary URL first, then fallback
  const uploaded = await tryUpload(API_URL);
  if (!uploaded) {
    await tryUpload(FALLBACK_API_URL);
  }
};

export const uploadDocument = async (
  uri: string,
  activeKeyRef: string,
  name: string,
  fileType: "image" | "pdf",
  cb: (status: number, filePath: string) => void,
) => {
  const API_URL = "http://154.117.189.170:3000/uploadDocument";
  const FALLBACK_API_URL = "http://41.169.31.194:3000/uploadDocument";

  const fileName = uri.substr(uri.lastIndexOf("/") + 1);

  // Determine file extension and mime type based on file type
  const extension = fileType === "pdf" ? ".pdf" : ".jpg";
  const mimeType = fileType === "pdf" ? "application/pdf" : "image/jpg";

  // Construct file path for documents
  let filePath =
    "../ais/public/docs/uploaded/" +
    activeKeyRef +
    "/" +
    activeKeyRef +
    "_doc_" +
    Math.floor(Math.random() * 899999 + 100000) +
    extension;

  console.log("Document filePath:", filePath);
  const formData = new FormData();
  formData.append("fileUrl", { uri, name: fileName, type: mimeType } as any);
  formData.append("filePath", filePath);
  formData.append("fileType", fileType); // Send file type to server - "pdf" or "image"

  const tryUpload = async (url: string): Promise<boolean> => {
    try {
      const response = await axios({
        method: "post",
        url,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log(`Document uploaded successfully to ${url}:`, response.data);
      cb(response.status, response.data); // response.data should contain the final file path after conversion if needed
      return true;
    } catch (error) {
      console.log(`Document upload failed for ${url}:`, error);
      return false;
    }
  };

  // Try primary URL first, then fallback
  const uploaded = await tryUpload(API_URL);
  if (!uploaded) {
    await tryUpload(FALLBACK_API_URL);
  }
};

export const getSocket = () => socket;

export const getTowingRequests = async (cb: (result: any[]) => void) => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, "towingRequests")),
    );
    const data = querySnapshot.docs.map((doc) => doc.data());
    cb(data);
  } catch (e) {
    console.error(e);
    cb([]);
  }
};

export const getChats = async (cb: (result: any[]) => void) => {
  try {
    const unsubscribe = onSnapshot(
      query(collection(db, "chats")),
      (querySnapshot) => {
        const messagesFireStore = querySnapshot
          .docChanges()
          .map(({ doc }) => {
            const message = doc.data();
            return { ...message, createdAt: message.createdAt?.toDate() };
          })
          .sort((a, b) => b.createdAt?.getTime() - a.createdAt?.getTime());
        cb(messagesFireStore);
      },
    );
    return () => unsubscribe();
  } catch (e) {
    console.error(e);
    cb([]);
  }
};

export const updateInsuranceDetails = async (
  Key_Ref: string,
  insuranceType: string,
  insuranceKey: string,
  cb: (result: boolean) => void,
) => {
  try {
    getNetworkStatus((socket) => {
      socket.emit(
        "updateInsuranceDetails",
        Key_Ref,
        insuranceType,
        insuranceKey,
        (result: boolean) => {
          cb(result);
        },
      );
    });
  } catch (e) {
    cb(false);
  }
};

// ------------------------- missing helpers from old Api -----------------------

export const getNotificationTokens = async (cb: (result: any[]) => void) => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, "mag_notifications")),
    );
    const data = querySnapshot.docs.map((doc) => doc.data());
    cb(data);
  } catch (e) {
    console.error("getNotificationTokens error", e);
    cb([]);
  }
};

export const sendPushNotification = async (
  to: string,
  title: string,
  body: string,
  data: any,
) => {
  if (to == null || to === undefined || to === "") return;
  const message = {
    to,
    sound: "default",
    title,
    body,
    data,
    priority: "high",
  };
  try {
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });
  } catch (error) {
    console.error("sendPushNotification failed", error);
  }
};

// Send notification to all registered devices in Firestore
export const sendNotificationToAllDevices = async (
  title: string,
  body: string,
  data: any = {},
) => {
  try {
    // Get all device tokens from Firestore
    const querySnapshot = await getDocs(query(collection(db, "device_tokens")));

    if (querySnapshot.empty) {
      console.log("[Notifications] No device tokens found in Firestore");
      return;
    }

    const tokens: string[] = [];
    querySnapshot.forEach((doc) => {
      const tokenData = doc.data();
      if (tokenData.token) {
        tokens.push(tokenData.token);
      }
    });

    console.log(`[Notifications] Sending to ${tokens.length} devices`);

    if (tokens.length === 0) {
      console.log("[Notifications] No valid tokens to send to");
      return;
    }

    // Send to Expo Push API in batches (max 100 per request)
    const batchSize = 100;
    for (let i = 0; i < tokens.length; i += batchSize) {
      const batch = tokens.slice(i, i + batchSize);
      const messages = batch.map((token) => ({
        to: token,
        sound: "default",
        title,
        body,
        data,
        priority: "high",
      }));

      try {
        await fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Accept-encoding": "gzip, deflate",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(messages),
        });
        console.log(
          `[Notifications] Sent batch ${Math.floor(i / batchSize) + 1}`,
        );
      } catch (error) {
        console.error("[Notifications] Failed to send batch:", error);
      }
    }

    console.log(
      `[Notifications] Completed sending to ${tokens.length} devices`,
    );
  } catch (error) {
    console.error("[Notifications] Error sending to all devices:", error);
  }
};

export const getComments = async (
  Key_Ref: string,
  cb: (result: any[]) => void,
) => {
  try {
    getNetworkStatus((socket) => {
      socket.emit("getComments", Key_Ref, (result: any[]) => {
        cb(result);
      });
    });
  } catch (e) {
    cb([]);
  }
};

export const saveNotes = async (
  notes: string,
  Key_Ref: string,
  userId: string,
  cb: (result: boolean) => void,
) => {
  try {
    getNetworkStatus((socket) => {
      socket.emit("saveNotes", notes, Key_Ref, userId, (result: boolean) => {
        cb(result);
      });
    });
  } catch (e) {
    cb(false);
  }
};
