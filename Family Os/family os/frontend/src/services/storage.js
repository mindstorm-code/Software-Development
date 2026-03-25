import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../firebase/firebaseApp";
import { computeFileHash } from "../utils/imageHash";
import { isDemoMode } from "../utils/mode";

export const uploadChoreImage = async ({ file, pathPrefix = "submissions" }) => {
  if (!file) {
    throw new Error("No file provided");
  }

  if (isDemoMode()) {
    const fileHash = await computeFileHash(file);
    return { url: `demo://${pathPrefix}/${Date.now()}-${file.name}`, hash: fileHash };
  }

  const fileHash = await computeFileHash(file);
  const fileRef = ref(storage, `${pathPrefix}/${Date.now()}-${file.name}`);

  await uploadBytes(fileRef, file);
  const url = await getDownloadURL(fileRef);

  return { url, hash: fileHash };
};
