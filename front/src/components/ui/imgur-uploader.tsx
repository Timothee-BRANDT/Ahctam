import React, { useState } from "react";
import { serverIP } from "@/app/constants";
import { useAuth } from "@/app/authContext";

interface ImgurImage {
  id: string;
  title: string;
  link: string;
}

const ImgurImageImporter: React.FC<{
  onImageSelect: (imageUrl: string) => void;
}> = ({ onImageSelect }) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [images, setImages] = useState<ImgurImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImgurImage | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user, setUser, isJwtInCookie, getCookie, setCookie } = useAuth();

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError("Please enter a search term");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = getCookie("jwt_token");
      const response = await fetch(
        `http://${serverIP}:5000/imgur?search_term=${searchTerm}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            ContentType: "application/json",
          },
        },
      );
      if (!response.ok) {
        throw new Error("Error fetching images");
      }
      const data = await response.json();
      // console.log("THE DATA:", data);
      const filteredImages = data.data
        .filter(
          (item: any) =>
            item.images && item.images[0].type.startsWith("image/"),
        )
        .map((item: any) => ({
          id: item.id,
          title: item.title,
          link: item.images[0].link,
        }));

      setImages(filteredImages);
    } catch (error) {
      console.error("Error searching:", error);
      setError(
        "An error occurred while fetching images. Please try again later.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = (image: ImgurImage) => {
    setSelectedImage(image);
    onImageSelect(image.link);
  };

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Rechercher des images"
      />
      <button onClick={handleSearch} disabled={isLoading}>
        {isLoading ? "Recherche..." : "Rechercher"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          marginTop: "20px",
        }}
      >
        {images.map((image) => (
          <img
            key={image.id}
            src={image.link}
            alt={image.title}
            style={{
              width: "100px",
              height: "100px",
              objectFit: "cover",
              cursor: "pointer",
            }}
            onClick={() => handleImageSelect(image)}
          />
        ))}
      </div>
    </div>
  );
};

export default ImgurImageImporter;
