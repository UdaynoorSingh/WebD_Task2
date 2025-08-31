import api from "./api";

export const uploadService = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await api.post("/upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  uploadImages: async (files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file);
    });

    const response = await api.post("/upload/images", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  uploadProfilePhoto: async (file) => {
    const formData = new FormData();
    formData.append('profilePhoto', file);

    const response = await api.post('/upload/profile-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  },

  deleteProfilePhoto: async () => {
    const response = await api.delete('/upload/profile-photo');
    return response.data;
  }
};