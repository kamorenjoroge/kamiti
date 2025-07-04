// components/Forms/ProductForm.tsx
"use client";

import Image from "next/image";
import { useState, useRef, ChangeEvent, FormEvent, useEffect } from "react";
import axios from "axios";
import { FiUpload, FiX, FiSave } from "react-icons/fi";
import toast from "react-hot-toast";

interface ProductFormProps {
  type: "create" | "update";
  productData?: {
    name: string;
    brand: string;
    category: string;
    price: string;
    quantity: number;
    description: string;
    color: string[];
    images: string[];
  };
  productId?: string;
  onSuccess?: () => void;
}

type Category = {
  _id: string;
  name: string;
};

const ProductForm: React.FC<ProductFormProps> = ({
  type = "create",
  productData,
  productId,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "",
    price: "",
    quantity: 1,
    description: "",
    color: [] as string[],
  });

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newColor, setNewColor] = useState("#000000");
  const [categories, setCategories] = useState<Category[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (type === "update" && productData) {
      setFormData({
        name: productData.name,
        brand: productData.brand,
        category: productData.category,
        price: productData.price,
        quantity: productData.quantity,
        description: productData.description,
        color: productData.color,
      });
      setExistingImages(productData.images || []);
    }
  }, [type, productData]);

  useEffect(() => {
  fetch("/api/category")
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        setCategories(data.data);
      }
    })
    .catch((err) => console.error("Failed to load categories:", err));
}, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    if (files.length + images.length + existingImages.length > 4) {
      setError("Maximum 4 images allowed");
      return;
    }

    setError("");
    setImages([...images, ...files]);
    setPreviews([...previews, ...files.map((file) => URL.createObjectURL(file))]);
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    const newPreviews = [...previews];
    URL.revokeObjectURL(previews[index]);
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    setImages(newImages);
    setPreviews(newPreviews);
  };

  const removeExistingImage = (index: number) => {
    const newExistingImages = [...existingImages];
    newExistingImages.splice(index, 1);
    setExistingImages(newExistingImages);
  };

  const addColor = () => {
    if (!formData.color.includes(newColor)) {
      setFormData({
        ...formData,
        color: [...formData.color, newColor],
      });
    }
  };

  const removeColor = (colorToRemove: string) => {
    setFormData({
      ...formData,
      color: formData.color.filter((color) => color !== colorToRemove),
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (images.length === 0 && existingImages.length === 0) {
      setError("At least one image is required");
      return;
    }

    if (formData.color.length === 0) {
      setError("At least one color is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("brand", formData.brand);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("quantity", formData.quantity.toString());
      formDataToSend.append("description", formData.description);
      formData.color.forEach((color) => formDataToSend.append("color", color));

      images.forEach((image) => formDataToSend.append("images", image));
      existingImages.forEach((image) => formDataToSend.append("existingImages", image));

      const url = type === "create" 
        ? "/api/tools" 
        : `/api/tools/${productId}`;
      const method = type === "create" ? "post" : "put";

      await axios[method](url, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(`Product ${type === "create" ? "added" : "updated"} successfully`);
      onSuccess?.();
      if (type === "create") resetForm();
    } catch (err) {
      setError(axios.isAxiosError(err) 
        ? err.response?.data?.error || err.message 
        : "An error occurred");
      toast.error("Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      brand: "",
      category: "",
      price: "",
      quantity: 1,
      description: "",
      color: [],
    });
    setImages([]);
    setExistingImages([]);
    previews.forEach((preview) => URL.revokeObjectURL(preview));
    setPreviews([]);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h1 className="text-2xl font-bold text-dark mb-6">
        {type === "create" ? "Add New Product" : "Edit Product"}
      </h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand *
            </label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              disabled={loading}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Category *
  </label>
  <select
    name="category"
    value={formData.category}
    onChange={handleChange}
    required
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
  >
    <option value="">Select Category</option>
    {categories.map((cat) => (
      <option key={cat._id} value={cat.name}>
        {cat.name}
      </option>
    ))}
  </select>
</div>


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (KES) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              disabled={loading}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity *
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Colors *
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="h-10 w-10 cursor-pointer"
              />
              <button
                type="button"
                onClick={addColor}
                className="px-3 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                Add Color
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.color.map((color, index) => (
                <div key={index} className="flex items-center gap-1">
                  <div
                    className="h-6 w-6 rounded-full border border-gray-300"
                    style={{ backgroundColor: color }}
                  />
                  <button
                    type="button"
                    onClick={() => removeColor(color)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Images (Max 4) *
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
            disabled={loading || (images.length + existingImages.length >= 4)}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading || (images.length + existingImages.length >= 4)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            <FiUpload /> Upload Images
          </button>
          <p className="mt-1 text-xs text-gray-500">
            {images.length + existingImages.length} of 4 images selected
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
            {existingImages.map((image, index) => (
              <div key={`existing-${index}`} className="relative">
                <Image
                  src={image}
                  alt={`Product ${index + 1}`}
                  width={200}
                  height={200}
                  className="rounded-md object-cover h-32 w-full"
                />
                <button
                  type="button"
                  onClick={() => removeExistingImage(index)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <FiX className="h-4 w-4" />
                </button>
              </div>
            ))}

            {previews.map((preview, index) => (
              <div key={`preview-${index}`} className="relative">
                <Image
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  width={200}
                  height={200}
                  className="rounded-md object-cover h-32 w-full"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <FiX className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={resetForm}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 rounded-md text-dark hover:bg-gray-50"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            <FiSave />
            {loading ? "Processing..." : type === "create" ? "Add Product" : "Update Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;