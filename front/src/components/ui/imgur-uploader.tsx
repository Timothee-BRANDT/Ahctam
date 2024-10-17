import React, { useState } from "react";

interface ImgurImage {
  id: string;
  title: string;
  link: string;
}

const ImgurImageImporter: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [images, setImages] = useState<ImgurImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImgurImage | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError("Veuillez entrer un terme de recherche");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://api.imgur.com/3/credits`, {
        headers: {
          Authorization: "Client-ID 05c6f9f028dbffb",
        },
      });

      // if (!response.ok) {
      //   throw new Error(`HTTP error! status: ${response.status}`);
      // }

      const data = await response.json();
      console.log("THE DATA:", data);
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
      console.error("Erreur lors de la recherche:", error);
      setError(
        "Une erreur est survenue lors de la recherche. Veuillez réessayer.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = (image: ImgurImage) => {
    setSelectedImage(image);
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

      {selectedImage && (
        <div style={{ marginTop: "20px" }}>
          <h3>Image sélectionnée :</h3>
          <img
            src={selectedImage.link}
            alt={selectedImage.title}
            style={{ maxWidth: "300px" }}
          />
          <p>Titre : {selectedImage.title}</p>
          <p>Lien : {selectedImage.link}</p>
        </div>
      )}
    </div>
  );
};

export default ImgurImageImporter;
