import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import useFetching from "../../hooks/useFetching";
import {
  addAProduct,
  deleteProductId,
  removeProduct,
  selectDeleteId,
  selectEditProduct,
  selectProducts,
  setProducts,
} from "../../redux/reducers/productReducer";
import {
  deleteProduct,
  getAllProducts,
  getCategories,
  searchByCategory,
  searchProducts,
} from "./api";
import DataTables from "./components/DataTables";
import { productsHeadings } from "./constants/headings";
import Select from "../../components/ui/Controls/Select";
import Input from "../../components/ui/Controls/Input";
import { useForm } from "react-hook-form";
import useLoading from "../../hooks/useLoading";
import { MdOutlineDownloadForOffline } from "react-icons/md";
import Button from "../../components/ui/Button";
import DeleteModal from "../../components/DeleteModal";
import { excelExport } from "../../helpers";
import { AiOutlinePlusCircle } from "react-icons/ai";
import ProductsModal from "./components/ProductsModal";

const ProductsPage = () => {
  const dispatch = useDispatch();
  const products = useSelector(selectProducts);

  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");

  const [deleteModal, setDeleteModal] = useState(false);
  const deleteId = useSelector(selectDeleteId);

  const editedProduct = useSelector(selectEditProduct);

  const [productModal, setProductModal] = useState({
    isActive: false,
    mode: "",
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const [fetchProducts, isLoading, error] = useFetching(async () => {
    const res = await getAllProducts();
    dispatch(setProducts(res));
  });

  const [fetchCategories] = useFetching(async () => {
    const res = await getCategories();
    setCategories(res);
  });

  const [searchProductsRequest] = useLoading({
    callback: async (data) => {
      const res = await searchProducts(data);
      dispatch(setProducts(res.products));
    },
    onError: () => {
      console.log("Error");
    },
  });

  const [searchByCategories] = useFetching(async () => {
    const res = await searchByCategory(category);
    dispatch(setProducts(res));
  });

  const handleDelete = async () => {
    dispatch(removeProduct(deleteId));
    await deleteProduct(deleteId);
  };

  const onSearch = (data) => {
    setCategory("");
    searchProductsRequest(data);
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    // reset();
    searchByCategories();
  }, [category]);

  useEffect(() => {
    if (!!deleteId) {
      setDeleteModal(true);
    }
  }, [deleteId]);

  useEffect(() => {
    if (Object.keys(editedProduct).length) {
      setProductModal({ isActive: true, mode: "Edit" });
    }
  }, [editedProduct]);

  useEffect(() => {
    if (deleteModal === false) {
      dispatch(deleteProductId(""));
    }
  }, [deleteModal]);

  useEffect(() => {
    if (watch("q") === "") {
      fetchProducts();
    }
  }, [watch("q")]);

  return (
    <div className="py-[60px] min-h-[100vh]">
      <div className="mx-auto">
        <div className="mb-5 text-[27px] font-semibold">Products</div>
        <div className="grid grid-cols-2 lg:grid-cols-3 bg-white rounded-md mb-2 py-2 px-4 justify-between">
          <div className="grid grid-cols-2 gap-2 my-2">
            <Select
              options={categories}
              value={category}
              setValue={setCategory}
              name="category"
              register={register}
              className="bg-white"
            />
            <form onSubmit={handleSubmit(onSearch)}>
              <Input
                name="q"
                className="bg-[#f1f1f1] rounded-lg "
                placeholder="Search products"
                register={register}
              />
            </form>
          </div>
          <div className="flex gap-2 ml-auto col-span-1 lg:col-span-2 my-auto ">
            <Button
              className="border border-black rounded-md bg-purple-400 text-white"
              iconLeft={<AiOutlinePlusCircle className="my-auto" />}
              onClick={() => setProductModal({ isActive: true, mode: "Add" })}
            >
              Add
            </Button>
            <Button
              className="border border-black text-black rounded-md"
              iconLeft={<MdOutlineDownloadForOffline className="my-auto" />}
              onClick={() => excelExport(products, "products.xlsx")}
            >
              Export
            </Button>
          </div>
        </div>
        <div className="rounded-lg">
          <DataTables data={products} columns={productsHeadings()} />
        </div>
      </div>
      <DeleteModal
        isVisible={deleteModal}
        setIsVisible={setDeleteModal}
        text="You are going to delete this product"
        title={`product ${deleteId}`}
        handleDelete={handleDelete}
      />
      {productModal.isActive ? (
        <ProductsModal
          isVisible={productModal.isActive}
          setIsVisible={(e) =>
            setProductModal({ ...productModal, isActive: e })
          }
          defaultValues={productModal.mode === "Edit" && editedProduct}
          mode={productModal.mode}
        />
      ) : null}
    </div>
  );
};

export default ProductsPage;
