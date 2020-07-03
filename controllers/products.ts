import { Client } from "https://deno.land/x/postgres/mod.ts";
import { v4 } from "https://deno.land/std/uuid/mod.ts";
import { Product } from "../types.ts";
import { dbCreds } from "../config.ts";

// Init Client

const client = new Client(dbCreds);

let products: Product[] = [
  {
    id: "1",
    name: "Product One",
    description: "This is product one",
    price: 29.99,
  },
  {
    id: "2",
    name: "Product Two",
    description: "This is product two",
    price: 39.99,
  },
  {
    id: "3",
    name: "Product Three",
    description: "This is product three",
    price: 59.99,
  },
];

const getProducts = async ({ response }: { response: any }) => {
  try {
    await client.connect();

    const result = await client.query("SELECT * FROM products");

    const products = new Array();

    result.rows.map((p) => {
      let obj: any = new Object();

      result.rowDescription.columns.map((el, i) => {
        obj[el.name] = p[i];
      });

      products.push(obj);
    });

    response.body = {
      success: true,
      data: products,
    };
  } catch (err) {
    response.status = 500;
    response.body = {
      success: false,
      msg: err.toString(),
    };
  } finally {
    await client.end();
  }
};

const getProduct = async({
  params,
  response,
}: {
  params: { id: string };
  response: any;
}) => {
  try {
    await client.connect()

    const result = await client.query("SELECT * FROM products WHERE id = $1",params.id)

    if(result.rows.toString() === ""){
      response.status = 404
      response.body = {
        success : false,
        msg : `No product with the id of ${params.id} found` 
      }
      return
    }
    else{
      const product : any = new Object()
      result.rows.map(p=>{
        result.rowDescription.columns.map((el,i)=>{
          product[el.name] = p[i] 
        })
      })

      response.body = {
        success : true,
        data : product
      }
    }
  } catch (err) {
    response.status = 500;
    response.body = {
      success: false,
      msg: err.toString(),
    };
  } finally {
    await client.end();
  }
};

const addProduct = async ({
  request,
  response,
}: {
  request: any;
  response: any;
}) => {
  const body = await request.body();
  const product = body.value;
  if (!request.hasBody) {
    response.status = 400;
    response.body = {
      success: false,
      msg: "Body Not Found",
    };
  } else {
    try {
      await client.connect();
      const result = await client.query(
        "INSERT INTO products(name,description,price)VALUES($1,$2,$3)",
        product.name,
        product.description,
        product.price
      );
      response.status = 201;
      response.body = {
        success: true,
        data: product,
      };
    } catch (err) {
      response.status = 500;
      response.body = {
        success: false,
        msg: err.toString(),
      };
    } finally {
      await client.end();
    }
  }
};

const updateProduct = async ({
  params,
  request,
  response,
}: {
  params: { id: string };
  request: any;
  response: any;
}) => {
  const product: Product | undefined = products.find((p) => p.id === params.id);
  if (product) {
    const body = await request.body();

    const updateData: { name?: string; descritpion?: string; price?: number } =
      body.value;

    products = products.map((p) =>
      p.id === params.id ? { ...p, ...updateData } : p
    );

    response.status = 200;
    response.body = {
      success: true,
      data: products,
    };
  } else {
    response.status = 404;
    response.body = {
      success: false,
      msg: "Product Not Fount",
    };
  }
};

const deleteProduct = ({
  params,
  response,
}: {
  params: { id: string };
  response: any;
}) => {
  products = products.filter((p) => p.id !== params.id);
  response.body = {
    success: true,
    msg: "Product Deleted",
    data: products,
  };
};

export { getProducts, getProduct, addProduct, updateProduct, deleteProduct };
