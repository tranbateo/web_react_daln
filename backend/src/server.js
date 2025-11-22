import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/db.js";
import { errorHandler } from "./middleware/errorHandler.js";

// 🟢 BẮT BUỘC: Import tất cả các Models để Mongoose tải chúng (Đây là 5 dòng quan trọng)
import Brand from "./models/Brand.js";
import Category from "./models/Category.js";
import Order from "./models/Order.js";
import Product from "./models/Product.js";
import User from "./models/User.js";

import authRoutes from "./routes/authRoutes.js";
import brandRoutes from "./routes/brandRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { createAdminIfMissing } from "./utils/seedAdmin.js";

dotenv.config();
const app = express();

// 🟢 Cấu hình CORS động
const allowedOrigins = [process.env.FRONTEND_URL, "http://localhost:5173"];

app.use(
	cors({
		origin: function (origin, callback) {
			if (!origin || allowedOrigins.indexOf(origin) !== -1) {
				callback(null, true);
			} else {
				callback(new Error("Bị chặn bởi CORS"));
			}
		},
		methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	})
);

app.use(express.json());

app.get("/", (req, res) => res.send("✅ Backend is running!"));

// Routes (Đăng ký tất cả các route ở đây)
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/chat", chatRoutes);

// Xử lý lỗi (Giữ nguyên)
app.use((req, res) => res.status(404).json({ message: "Route not found" }));
app.use(errorHandler);

// DI CHUYỂN LOG KEY VÀ KHỞI ĐỘNG SAU KHI TẤT CẢ ROUTE ĐƯỢC ĐĂNG KÝ
const PORT = process.env.PORT || 5000;
(async () => {
	try {
		// 1. Kiểm tra Key (sau khi dotenv.config() chạy)
		if (process.env.GEMINI_API_KEY) {
			console.log(
				"✅ Chatbot API Key loaded successfully. (Length:",
				process.env.GEMINI_API_KEY.length,
				")"
			);
		} else {
			console.error(
				"❌ Chatbot API Key NOT found in environment variables. CHECK .env FILE!"
			);
		}

		// 2. Kết nối DB (Models được load ở trên)
		await connectDB();
		await createAdminIfMissing();

		// 3. Khởi động Server
		app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
	} catch (error) {
		console.error("Failed to start server:", error.message);
	}
})();
