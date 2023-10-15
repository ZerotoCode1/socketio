import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from'mongoose'
import Product from "./models/productModel.js";



const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods:"*",
  },
});
mongoose.connect('mongodb+srv://amazona:amazona@cluster0.zovzr.mongodb.net/amazona?retryWrites=true&w=majority ', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Đã kết nối tới MongoDB');
  })
  .catch(error => {
    console.error('Lỗi kết nối tới MongoDB: ' + error);
  });
io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);
    
 

  socket.on("getproduct", (data) => {
            console.log("có kết nối");
            
    try {
      Product.find({})
      .then((documents) => {
        if (Array.isArray(documents)) {
          
        io.sockets.emit("productData",documents)
          //  console.log(documents);
            
        } else {
          console.error('Dữ liệu trả về không phải là mảng');
        }
      })
      .catch((error) => {
           console.log(error);
      });
    } catch (error) {
      console.log(error);
    }
   
  });

 
  socket.on('updateProduct', async (data) => {
    console.log("kết nối update");
    try {
      // Xác định sản phẩm cần cập nhật bằng ID
      const productId = data.productId;
      const newData = data.newData;

      // Thực hiện cập nhật dữ liệu
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: productId },
        newData,
        { new: true } // Trả về sản phẩm sau khi cập nhật
      );
      io.emit('productUpdated', updatedProduct);
      console.log('cập nhật thành công');
     
    } catch (error) {
      console.error('Lỗi khi cập nhật sản phẩm:', error);
    }
   
  });

  socket.on('deleteProduct', async (productId) => {
    console.log('có người muốn xoá');
    try {
      await Product.findByIdAndRemove(productId);
      socket.emit('productDeleted', { message: 'Sản phẩm đã được xóa thành công.' });
    } catch (error) {
      socket.emit('productDeleteError', { error: 'Lỗi xóa sản phẩm.' });
    }
  });
  
});

server.listen(3001, () => {
  console.log("SERVER IS RUNNING");
});
