"use client";
import Category from "../components/Modal/Category";
import { FiList, FiPlusCircle } from "react-icons/fi";

const ProductsPage = () => {
  const handleSuccess = () => {
    console.log("Operation successful - could refresh data here");
    // You could add state management here if needed
  };

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* Add New Product */}
        <Category
          type="create"
          onSuccess={handleSuccess}
          buttonText="Add New Product"
          buttonIcon={FiPlusCircle}
          buttonClassName="p-4 border-2 border-dashed border-primary rounded-lg hover:border-primary hover:bg-secondary transition-colors group w-full"
        />

        {/* View All Products */}
        <Category
          type="view"
          onSuccess={handleSuccess}
          buttonText="View All Products"
          buttonIcon={FiList}
          buttonClassName="p-4 border-2 border-dashed border-primary rounded-lg hover:border-primary hover:bg-secondary transition-colors group w-full"
          modalTitle="Product Inventory"
        />
      </div>
    </div>
  );
};

export default ProductsPage;
